"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Room = {
	id: string;
	hostUserId: string;
	guestUserId: string;
	status: string;
	currentTurnUserId: string;
};

type Character = {
	characterId: number;
	level: number;
	character: {
		id: number;
		name: string;
		image_url: string;
		rarity: number;
		base_life: number;
		base_power: number;
		base_speed: number;
		skill: string;
	};
};

type SelectCharacter = {
	characterId: number;
	level: number;
	character: Character;
};

type ToggleCharacter = {
	characterId: number;
};

export default function RoomListPage() {
	const { user } = useAuth();
	const router = useRouter();

	const [roomList, setRoomList] = useState<Room[]>([]);
	const [characters, setCharacters] = useState<Character[]>([]);
	const [selectedCharacters, setSelectedCharacters] = useState<
		SelectCharacter[]
	>([]);
	const [error, setError] = useState<string | null>(null);

	// キャラクター一覧取得
	useEffect(() => {
		if (user) {
			(async () => {
				// ルーム一覧を取得
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms`,
				);
				if (!res.ok) {
					throw new Error("ルームの取得に失敗しました");
				}
				const data = await res.json();
				setRoomList(data.rooms);

				// キャラクター一覧を取得
				const charRes = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${user.uid}/characters`,
				);
				const charData = await charRes.json();
				console.info("charData", charData);
				setCharacters(charData);
			})();
		}
	}, [user]);

	// キャラクター選択処理
	const toggleCharacter = (character: Character) => {
		if (
			selectedCharacters.some((c) => c.characterId === character.characterId)
		) {
			setSelectedCharacters((prev) =>
				prev.filter((c) => c.characterId !== character.characterId),
			);
		} else {
			if (selectedCharacters.length < 3) {
				setSelectedCharacters(
					(prev) => [...prev, character] as SelectCharacter[],
				);
			}
		}
	};

	// キャラセットしてルームに参加 or 作成
	const handleRoomAction = async (roomId?: string) => {
		if (!user) return;

		console.info("roomId", roomId);

		if (selectedCharacters.length < 1 || selectedCharacters.length > 3) {
			setError("パーティは 1 〜 3 体まで選択してください");
			return;
		}
		setError(null);

		// ルームに参加（既存のルーム）
		if (roomId) {
			console.info("tst", roomId);
			await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/join`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					guestUserId: user.uid,
					roomId: roomId,
					characters: selectedCharacters,
				}),
			});
			router.push(`/rooms/${roomId}`);
		}
		// ルームを新規作成（ホスト）
		else {
			const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					hostUserId: user.uid,
					characters: selectedCharacters,
				}),
			});
			const data = await res.json();
			router.push(`/rooms/${data.room.id}`);
		}
	};

	if (!user) return <p>...loading</p>;

	console.info("characters", characters);

	return (
		<div className="min-h-screen text-black flex flex-col items-center justify-center bg-gray-100 p-4">
			<h1 className="text-3xl font-bold mb-6">キャラクターを選択</h1>

			{/* キャラクター一覧 */}
			<div className="grid grid-cols-3 gap-4">
				{characters.map((char) => (
					<button
						type="button"
						key={char.characterId}
						onClick={() => toggleCharacter(char)}
						className={`p-4 border rounded-md ${
							selectedCharacters.some((c) => c.characterId === char.characterId)
								? "bg-blue-500 text-white"
								: "bg-white"
						}`}
					>
						<p>{char.characterId}</p>
						<p>レベル: {char.level}</p>
						<p>名前: {char.character.name}</p>
						<Image
							src={char.character.image_url}
							alt={char.character.name}
							width={100}
							height={100}
						/>
					</button>
				))}
			</div>

			<p className="mt-4">選択中: {selectedCharacters.length} / 3</p>
			{error && <p className="text-red-500">{error}</p>}

			{/* ルームを作成する */}
			<button
				type="button"
				className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md"
				onClick={() => handleRoomAction()}
			>
				新しいルームを作成
			</button>

			<h2 className="text-2xl font-bold mt-8">ルーム一覧</h2>

			{/* ルーム一覧（参加用） */}
			{roomList.map((room) => (
				<button
					type="button"
					onClick={() => handleRoomAction(room.id)}
					key={room.id}
					className="bg-white p-4 rounded-md shadow-md mb-4"
				>
					<p>{room.id}</p>
				</button>
			))}
		</div>
	);
}

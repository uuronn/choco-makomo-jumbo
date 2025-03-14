"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import Image from "next/image";

export default function CharacterListPage() {
	const { user } = useAuth();

	const [characterList, setCharacterList] = useState<any>([]);

	useEffect(() => {
		if (user) {
			(async () => {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${user.uid}/characters`,
				);
				if (!res.ok) {
					throw new Error("キャラクターの取得に失敗しました");
				}

				const data = await res.json();
				setCharacterList(data);
			})();
		}
	}, [user]);

	if (!user) return <p>...loading</p>;

	return (
		<div className="min-h-screen text-black flex flex-col items-center justify-center bg-gray-100 p-4">
			<h1 className="text-3xl font-bold mb-6">キャラ一覧</h1>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{characterList.map((userCharacter: any) => (
					<div
						key={`${userCharacter.user_id}-${userCharacter.character_id}`}
						className="bg-white p-4 rounded-lg shadow"
					>
						<h2 className="text-xl font-semibold">
							{userCharacter.character.name}
						</h2>
						<Image
							src={userCharacter.character.image_url}
							alt="test"
							width={100}
							height={100}
						/>
						<p>レア度: {userCharacter.character.rarity}</p>
						<p>レベル: {userCharacter.level}</p>
						<p>ライフ: {userCharacter.life}</p>
						<p>パワー: {userCharacter.power}</p>
						<p>スピード: {userCharacter.speed}</p>
					</div>
				))}
			</div>
		</div>
	);
}

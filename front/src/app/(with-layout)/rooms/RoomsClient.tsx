"use client";

import type React from "react";
import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import {
	Plus,
	Users,
	ChevronRight,
	Minus,
	UserIcon,
	BotIcon,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { characterToImagePath, cn } from "~/lib/utils";
import { useUserContext } from "~/context/UserProvider";
import type { Character } from "~/type/character";
import { useRouter } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { useUserCharacterList } from "~/hook/useUserCharacter";
import { SectionContainer } from "~/components/SectionContainer";

type SelectingRoom = {
	id: string;
	host_user: {
		id: string;
		name: string;
		photoUrl: string;
	};
	guest_user: {
		id: string;
		name: string;
		photoUrl: string;
	} | null;
	character_list?: Character[];
};

type PartyRoom = {
	id: string;
	host_user: {
		id: string;
		name: string;
		photoUrl: string;
	};
	character_list?: Character[];
	hasPassword: boolean;
};

type RoomsClientProps = {
	initialToken: string;
	children: ReactNode;
};

type BattleMode = "solo" | "duo" | "war" | "cpu";

export function RoomsClient({ initialToken, children }: RoomsClientProps) {
	// 既存のstateはそのまま
	const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
	const [selectedRoom, setSelectedRoom] = useState<SelectingRoom | null>(null);
	const [rooms, setRooms] = useState<SelectingRoom[]>([]);
	const [showCpuOptions, setShowCpuOptions] = useState(false);
	const [detailCharacter, setDetailCharacter] = useState<Character | null>(
		null,
	);
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [selectMode, setSelectMode] = useState<BattleMode>("solo");
	// const [partyRooms, setPartyRooms] = useState<PartyRoom[]>([
	// 	{
	// 		id: "party-1",
	// 		host_user: {
	// 			id: "user-1",
	// 			name: "テストユーザー1",
	// 			photoUrl: "/placeholder.svg",
	// 		},
	// 		// character_list: [
	// 		// 	{
	// 		// 		characterId: "char-1",
	// 		// 		name: "Python",
	// 		// 		level: 5,
	// 		// 		exp: 100,
	// 		// 		maxExp: 200,
	// 		// 	},
	// 		// 	{
	// 		// 		characterId: "char-2",
	// 		// 		name: "JavaScript",
	// 		// 		level: 3,
	// 		// 		exp: 50,
	// 		// 		maxExp: 100,
	// 		// 	},
	// 		// ],
	// 		hasPassword: true,
	// 	},
	// 	{
	// 		id: "party-2",
	// 		host_user: {
	// 			id: "user-2",
	// 			name: "テストユーザー2",
	// 			photoUrl: "/placeholder.svg",
	// 		},
	// 		character_list: [
	// 			{
	// 				characterId: "char-3",
	// 				name: "Java",
	// 				level: 4,
	// 				// exp: 75,
	// 				maxExp: 150,
	// 			},
	// 		],
	// 		hasPassword: false,
	// 	},
	// ]);
	const [partyPassword, setPartyPassword] = useState<string>("");
	const [isCreatePartyModalOpen, setIsCreatePartyModalOpen] = useState(false);

	const { user } = useUserContext();
	const router = useRouter();

	const { data: havingCharacters } = useUserCharacterList(
		user?.uid ?? null,
		initialToken,
	);

	// APIリクエストのトークン処理を修正
	const createRoom = async () => {
		if (!user) return;
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/create`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${initialToken}`,
				},
				body: JSON.stringify({
					hostUserId: user.uid,
					characterIdList: selectedCharacters.map(
						(character) => character.characterId,
					),
				}),
			},
		);
		const data = await res.json();
		router.push(`/rooms/${data.id}`);
	};

	const joinRoom = async () => {
		if (!user) return;
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/join`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${initialToken}`,
				},
				body: JSON.stringify({
					roomId: selectedRoom?.id,
					characterIdList: selectedCharacters.map(
						(character) => character.characterId,
					),
					guestUserId: user.uid,
				}),
			},
		);

		const data = await res.json();
		router.push(`/rooms/${selectedRoom?.id}`);
	};

	const startCpuBattle = async () => {
		if (!user) return;
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/cpu-battle/create`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${initialToken}`,
				},
				body: JSON.stringify({
					userId: user.uid,
					characterIdList: selectedCharacters.map((c) => c.characterId),
				}),
			},
		);
		const data = await res.json();
		if (res.ok) {
			enqueueSnackbar("CPU対戦を開始します", { variant: "success" });
			router.push(`/rooms/${data.id}`);
		} else {
			enqueueSnackbar(data.message, { variant: "error" });
		}
	};

	// ルーム一覧の取得
	useEffect(() => {
		const fetchRooms = async () => {
			const roomsRes = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms`,
				{
					headers: {
						Authorization: `Bearer ${initialToken}`,
					},
				},
			);
			const roomsData = await roomsRes.json();
			setRooms(roomsData);
		};

		fetchRooms();
	}, [initialToken]);

	const handleSelectCharacter = (character: Character) => {
		if (
			selectedCharacters.find((c) => c.characterId === character.characterId)
		) {
			setSelectedCharacters(
				selectedCharacters.filter(
					(c) => c.characterId !== character.characterId,
				),
			);
		} else if (selectedCharacters.length < 3) {
			setSelectedCharacters([...selectedCharacters, character]);
		}
	};

	const handleSelectRoom = (room: SelectingRoom) => {
		setSelectedRoom(room);
		setShowCpuOptions(false);
	};

	const toggleCpuOptions = () => {
		setShowCpuOptions(!showCpuOptions);
		setSelectedRoom(null);
	};

	const openCharacterDetail = (character: Character, e: React.MouseEvent) => {
		e.stopPropagation();
		setDetailCharacter(character);
		setIsDetailModalOpen(true);
	};

	const refreshRooms = async () => {
		enqueueSnackbar("ルーム一覧を更新", {
			variant: "success",
		});
		const roomsRes = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms`,
			{
				headers: {
					Authorization: `Bearer ${initialToken}`,
				},
			},
		);
		const roomsData = await roomsRes.json();
		setRooms(roomsData);
	};

	const isButtonDisabled = selectedCharacters.length === 0;

	// パーティルーム一覧取得の関数を外に出す
	const fetchPartyRooms = async () => {
		if (selectMode !== "duo") return;
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/party-rooms`,
			{
				headers: {
					Authorization: `Bearer ${initialToken}`,
				},
			},
		);
		const data = await res.json();
		// setPartyRooms(data);
	};

	// useEffectも修正
	// useEffect(() => {
	// 	if (selectMode === "duo") {
	// 		fetchPartyRooms();
	// 		// 定期的に更新
	// 		const interval = setInterval(fetchPartyRooms, 5000);
	// 		return () => clearInterval(interval);
	// 	}
	// }, [selectMode, initialToken]);

	return (
		<div className="space-y-4 flex flex-col h-full">
			<div className="flex gap-4 min-h-1/2">
				{/* 選択中のキャラクター表示セクション */}
				<SectionContainer title="選択中の技術" className="h-full">
					<div className="flex flex-col gap-4">
						{selectedCharacters.length > 0 ? (
							selectedCharacters.map((character) => (
								<div
									key={character.characterId}
									className="relative bg-gray-800/50 border border-emerald-500/30 rounded-lg p-3 flex items-center gap-3"
								>
									<div className="relative w-12 h-12 overflow-hidden rounded-lg">
										<Image
											src={
												characterToImagePath(character.characterId) ||
												"/placeholder.svg" ||
												"/placeholder.svg"
											}
											alt={character.name}
											fill
											className="object-cover"
										/>
									</div>
									<div className="flex-1">
										<div className="font-medium text-green-200">
											{character.name}
										</div>
										<div className="text-xs text-emerald-400">
											Lv.{character.level}
										</div>
									</div>
									<Button
										variant="ghost"
										size="icon"
										className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400"
										onClick={() =>
											setSelectedCharacters(
												selectedCharacters.filter(
													(c) => c.characterId !== character.characterId,
												),
											)
										}
									>
										<Minus className="h-4 w-4" />
									</Button>
								</div>
							))
						) : (
							<div className="text-green-400/50 text-center w-full py-4">
								技術を選択してください（最大3体）
							</div>
						)}
					</div>
					{/* </div> */}
				</SectionContainer>

				{children}
			</div>

			<SectionContainer title="ルーム一覧">
				{/* 対戦モード選択タブ */}
				<div className="flex mb-2 mt-4 gap-2">
					<Button
						onClick={() => setSelectMode("solo")}
						className={cn(
							"text-sm",
							selectMode === "solo"
								? "bg-green-400 text-black hover:bg-green-500"
								: "bg-black/30 border-green-400/30 text-green-400 hover:bg-green-400/20",
						)}
					>
						<UserIcon className="h-4 w-4" /> ソロ対戦
					</Button>
					<Button
						onClick={() => setSelectMode("cpu")}
						className={cn(
							"text-sm",
							selectMode === "cpu"
								? "bg-green-400 text-black hover:bg-green-500"
								: "bg-black/30 border-green-400/30 text-green-400 hover:bg-green-400/20",
						)}
					>
						<BotIcon className="h-4 w-4" /> CPU対戦
					</Button>
				</div>

				{selectMode === "duo" ? (
					<>
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-lg font-bold text-green-400 flex items-center">
								<Users className="mr-2 h-5 w-5" />
								{selectedRoom ? "選択中のパーティ" : "参加可能なパーティ"}
							</h2>
							{!selectedRoom && (
								<div className="flex gap-2">
									<Button
										onClick={() => setIsCreatePartyModalOpen(true)}
										className="bg-green-400 text-black hover:bg-green-500 text-sm"
										disabled={isButtonDisabled}
									>
										<Plus className="h-4 w-4 mr-1" /> パーティ作成
									</Button>
									<Button
										onClick={refreshRooms}
										className="bg-green-400 text-black hover:bg-green-500 text-sm"
									>
										更新
									</Button>
								</div>
							)}
						</div>

						<div
							className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto"
							style={{ maxHeight: "calc(100vh - 400px)" }}
						>
							{/* 選択中のパーティがある場合はそれのみ表示 */}
							{selectedRoom ? (
								<div className="col-span-full">
									<div className="flex justify-between items-center mb-4">
										<div className="flex items-center gap-4">
											{/* 選択中のパーティ表示 */}
											{/* ... */}
										</div>
										<Button
											onClick={() => setSelectedRoom(null)}
											variant="outline"
											className="text-sm"
										>
											別のパーティを選択
										</Button>
									</div>
								</div>
							) : (
								<></>
								// 参加可能なパーティ一覧
								// partyRooms.map((room) => (
								// 	<div
								// 		key={room.id}
								// 		className={cn(
								// 			"flex flex-col rounded-lg border p-4 transition-all cursor-pointer",
								// 			selectedRoom?.id === room.id
								// 				? "bg-green-400/20 border-green-400"
								// 				: "bg-black/30 border-green-400/20 hover:bg-green-400/10",
								// 		)}
								// 		onClick={() => handleSelectRoom(room)}
								// 	>
								// 		<div className="flex items-center gap-3 mb-2">
								// 			<Image
								// 				src={room.host_user.photoUrl || "/placeholder.svg"}
								// 				alt={room.host_user.name}
								// 				width={40}
								// 				height={40}
								// 				className="rounded-full"
								// 			/>
								// 			<div>
								// 				<p className="font-medium text-green-200">
								// 					{room.host_user.name}
								// 				</p>
								// 				<p className="text-xs text-green-400">
								// 					{room.hasPassword
								// 						? "🔒 パスワード有り"
								// 						: "誰でも参加可能"}
								// 				</p>
								// 			</div>
								// 		</div>
								// 		<div className="flex items-center gap-2">
								// 			{room.character_list?.map((character) => (
								// 				<div
								// 					key={character.characterId}
								// 					className="relative w-8 h-8"
								// 				>
								// 					<Image
								// 						src={
								// 							characterToImagePath(character.characterId) ||
								// 							"/placeholder.svg"
								// 						}
								// 						alt={character.name}
								// 						fill
								// 						className="rounded-lg object-cover"
								// 					/>
								// 				</div>
								// 			))}
								// 		</div>
								// 	</div>
								// ))
							)}
						</div>
					</>
				) : showCpuOptions ? (
					<div className="space-y-4 h-[calc(100%-40px)] flex flex-col justify-center">
						<div className="flex justify-center mt-4">
							<Button
								onClick={startCpuBattle}
								className="w-2/3 bg-green-400 text-black hover:bg-green-500 text-sm h-10"
								disabled={isButtonDisabled}
							>
								CPU対戦を開始 <ChevronRight className="ml-1 h-4 w-4" />
							</Button>
						</div>
					</div>
				) : (
					<>
						<h2 className="text-lg font-bold mb-2 text-green-400 flex items-center">
							<Users className="mr-2 h-5 w-5" /> ルーム選択{" "}
							<Button
								onClick={refreshRooms}
								className="ml-2 bg-green-400 text-black hover:bg-green-500 text-sm h-9"
							>
								更新
							</Button>
						</h2>

						<div className="space-y-3 h-[calc(100%-40px)]">
							{/* ルーム一覧 */}
							<div className="overflow-x-auto h-[calc(100%-40px)]">
								<div className="flex h-full gap-4 items-center">
									{rooms
										.filter(
											(room) =>
												room.guest_user === null &&
												room.host_user.id !== user?.uid,
										)
										.map((room) => (
											<div
												key={room.id}
												className={cn(
													"flex flex-col rounded-lg border transition-all justify-center items-center cursor-pointer min-w-[200px] min-h-[160px] overflow-hidden",
													selectedRoom?.id === room.id
														? "bg-green-400/20 border-green-400"
														: "bg-black/30 border-green-400/20 hover:bg-green-400/10",
												)}
												onClick={() => handleSelectRoom(room)}
											>
												<div className="relative h-[90px] w-full flex items-center justify-center">
													<Image
														src={room.host_user.photoUrl || "/placeholder.svg"}
														alt={room.id}
														width={80}
														height={80}
														className="object-cover rounded-full"
													/>
												</div>
												<div className="p-2 text-center">
													<h4 className="font-bold text-green-400 text-sm">
														{room.host_user.name}
													</h4>
												</div>
											</div>
										))}
								</div>
							</div>

							{/* アクションボタン */}
							<div className="flex gap-4 justify-around">
								<Button
									onClick={joinRoom}
									className="w-[calc(50%-10px)] bg-green-400 text-black hover:bg-green-500 text-sm h-9"
									disabled={isButtonDisabled || !selectedRoom}
								>
									入室 <ChevronRight className="ml-1 h-4 w-4" />
								</Button>
								<Button
									onClick={createRoom}
									variant="outline"
									className="w-[calc(50%-10px)] bg-green-400 text-black hover:bg-green-500 text-sm h-9"
									disabled={isButtonDisabled}
								>
									<Plus className="mr-1 h-4 w-4" /> ルーム作成
								</Button>
							</div>
						</div>
					</>
				)}
			</SectionContainer>
		</div>
	);
}

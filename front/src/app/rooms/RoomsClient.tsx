"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
	Plus,
	Users,
	ChevronRight,
	Info,
	Minus,
	HandshakeIcon,
	UserIcon,
	UsersIcon,
	SwordsIcon,
	BotIcon,
	CpuIcon,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { characterToImagePath, cn } from "~/lib/utils";
import { useUserContext } from "~/context/UserProvider";
import type { Character } from "~/type/character";
import { FaLaptopCode } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { useUserCharacterList } from "~/hook/useUserCharacter";
import CharacterDetailModal from "./chara-modal";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
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
};

type BattleMode = "solo" | "duo" | "war" | "cpu";

export function RoomsClient({ initialToken }: RoomsClientProps) {
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
	const [partyRooms, setPartyRooms] = useState<PartyRoom[]>([
		{
			id: "party-1",
			host_user: {
				id: "user-1",
				name: "テストユーザー1",
				photoUrl: "/placeholder.svg",
			},
			character_list: [
				{
					characterId: "char-1",
					name: "Python",
					level: 5,
					exp: 100,
					maxExp: 200,
				},
				{
					characterId: "char-2",
					name: "JavaScript",
					level: 3,
					exp: 50,
					maxExp: 100,
				},
			],
			hasPassword: true,
		},
		{
			id: "party-2",
			host_user: {
				id: "user-2",
				name: "テストユーザー2",
				photoUrl: "/placeholder.svg",
			},
			character_list: [
				{
					characterId: "char-3",
					name: "Java",
					level: 4,
					exp: 75,
					maxExp: 150,
				},
			],
			hasPassword: false,
		},
	]);
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

	// パーティルーム作成の処理を修正（テスト用）
	const createPartyRoom = async () => {
		if (!user) {
			enqueueSnackbar("ユーザー情報が取得できません", { variant: "error" });
			return;
		}

		// APIリクエストをスキップしてテストデータを直接追加
		const newPartyRoom = {
			id: `test-${Date.now()}`,
			host_user: {
				id: user.uid,
				name: user.name || "あなた",
				photoUrl: "/placeholder.svg",
			},
			character_list: selectedCharacters,
			hasPassword: partyPassword !== "",
		};

		setPartyRooms((prev) => [...prev, newPartyRoom]);
		enqueueSnackbar("パーティルームを作成しました", { variant: "success" });
		setIsCreatePartyModalOpen(false);
		setPartyPassword("");
	};

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
		setPartyRooms(data);
	};

	// useEffectも修正
	useEffect(() => {
		if (selectMode === "duo") {
			fetchPartyRooms();
			// 定期的に更新
			const interval = setInterval(fetchPartyRooms, 5000);
			return () => clearInterval(interval);
		}
	}, [selectMode, initialToken]);

	return (
		<div className="container mx-auto p-4 flex flex-col max-h-screen">
			<div className="flex gap-4 h-[50vh]">
				{/* 選択中のキャラクター表示セクション */}
				<section className="w-1/3 min-w-[300px]">
					<div className="bg-gray-900/80 border border-green-400/30 rounded-lg p-4 h-full">
						<div className="mb-4">
							<h2 className="text-xl font-bold text-green-400 flex items-center">
								<Users className="mr-2" />
								選択中の技術
								<div className="h-px flex-grow ml-4 bg-gradient-to-r from-emerald-400 to-transparent" />
							</h2>
						</div>

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
					</div>
				</section>

				<SectionContainer title="所持技術" icon={<CpuIcon />}>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
						{havingCharacters?.map((character) => (
							<div
								key={character.characterId}
								className={`cursor-pointer p-2 rounded-lg transition-all relative ${
									selectedCharacters.find(
										(c) => c.characterId === character.characterId,
									)
										? "bg-emerald-500/20 border border-emerald-500"
										: "hover:bg-gray-800 border border-emerald-500/10 hover:border-emerald-500/50"
								}`}
								onClick={() => handleSelectCharacter(character)}
							>
								<div className="flex flex-col items-center">
									<div className="relative w-16 h-16 mb-2 overflow-hidden rounded-lg">
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
									<div className="text-center font-medium text-green-200 truncate w-full">
										{character.name}
									</div>
									<div className="text-center text-xs text-emerald-400">
										Lv.{character.level}
									</div>
								</div>
								<Button
									variant="ghost"
									size="icon"
									className="absolute top-1 right-1 h-6 w-6 rounded-full text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 p-1"
									onClick={(e) => openCharacterDetail(character, e)}
								>
									<Info className="h-4 w-4" />
								</Button>
							</div>
						))}
					</div>
				</SectionContainer>

				{/* キャラクター選択セクション */}
				{/* <SectionContainer title="技術選択" icon={<CpuIcon />}>
					{havingCharacters?.map((character) => (
						<div
							key={character.characterId}
							className={`cursor-pointer p-2 rounded-lg transition-all relative ${
								selectedCharacters.find(
									(c) => c.characterId === character.characterId,
								)
									? "bg-emerald-500/20 border border-emerald-500"
									: "hover:bg-gray-800 border border-emerald-500/10 hover:border-emerald-500/50"
							}`}
							onClick={() => handleSelectCharacter(character)}
						>
							<div className="flex flex-col items-center">
								<div className="relative w-16 h-16 mb-2 overflow-hidden rounded-lg">
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
								<div className="text-center font-medium text-green-200 truncate w-full">
									{character.name}
								</div>
								<div className="text-center text-xs text-emerald-400">
									Lv.{character.level}
								</div>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="absolute top-1 right-1 h-6 w-6 rounded-full text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 p-1"
								onClick={(e) => openCharacterDetail(character, e)}
							>
								<Info className="h-4 w-4" />
							</Button>
						</div>
					))}
				</SectionContainer> */}
			</div>

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
					onClick={() => setSelectMode("duo")}
					className={cn(
						"text-sm",
						selectMode === "duo"
							? "bg-green-400 text-black hover:bg-green-500"
							: "bg-black/30 border-green-400/30 text-green-400 hover:bg-green-400/20",
					)}
				>
					<UsersIcon className="h-4 w-4" /> デュオ対戦
				</Button>
				<Button
					onClick={() => setSelectMode("war")}
					className={cn(
						"text-sm",
						selectMode === "war"
							? "bg-green-400 text-black hover:bg-green-500"
							: "bg-black/30 border-green-400/30 text-green-400 hover:bg-green-400/20",
					)}
				>
					<SwordsIcon className="h-4 w-4" /> 大戦争
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

			{/* デュオ対戦パートナー情報 */}
			{selectMode === "duo" && (
				<div className="mb-3 border border-green-400/30 rounded-lg p-3 backdrop-blur-sm backdrop-filter bg-black/20">
					<div className="flex items-center gap-3">
						<HandshakeIcon className="text-green-400 h-5 w-5" />
						<h3 className="text-green-400 font-medium">パートナー情報</h3>
					</div>

					<div className="mt-2 flex items-center gap-4">
						<div className="flex items-center gap-3 bg-green-400/10 rounded-lg p-2 flex-1">
							<div className="relative h-10 w-10">
								<Image
									src={user?.photoURL || "/placeholder.svg"}
									alt="Your avatar"
									width={40}
									height={40}
									className="rounded-full object-cover"
								/>
								<div className="absolute -bottom-1 -right-1 bg-green-400 text-xs text-black font-bold rounded-full h-5 w-5 flex items-center justify-center">
									1
								</div>
							</div>
							<div>
								<p className="text-green-200 text-sm font-medium">
									{user?.displayName || "あなた"}
								</p>
								<p className="text-xs text-green-400/70">
									選択中: {selectedCharacters.length}体
								</p>
							</div>
						</div>

						<div className="text-green-400 font-bold">+</div>

						<div className="flex items-center gap-3 bg-green-400/10 rounded-lg p-2 flex-1">
							<div className="relative h-10 w-10">
								<Image
									src={"/placeholder.svg"}
									alt="Partner avatar"
									width={40}
									height={40}
									className="rounded-full object-cover"
								/>
								<div className="absolute -bottom-1 -right-1 bg-green-400 text-xs text-black font-bold rounded-full h-5 w-5 flex items-center justify-center">
									2
								</div>
							</div>
							<div>
								<p className="text-green-200 text-sm font-medium">
									{"selectedRoom.host_user.name"}
								</p>
								<p className="text-xs text-green-400/70">
									選択中: {"selectedRoom.character_list?.length" || 0}体
								</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* ルーム選択またはCPU対戦セクション */}
			<section className="border border-green-400/30 rounded-lg p-3 backdrop-blur-sm backdrop-filter bg-black/20 flex-1 overflow-hidden">
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
								// 参加可能なパーティ一覧
								partyRooms.map((room) => (
									<div
										key={room.id}
										className={cn(
											"flex flex-col rounded-lg border p-4 transition-all cursor-pointer",
											selectedRoom?.id === room.id
												? "bg-green-400/20 border-green-400"
												: "bg-black/30 border-green-400/20 hover:bg-green-400/10",
										)}
										onClick={() => handleSelectRoom(room)}
									>
										<div className="flex items-center gap-3 mb-2">
											<Image
												src={room.host_user.photoUrl || "/placeholder.svg"}
												alt={room.host_user.name}
												width={40}
												height={40}
												className="rounded-full"
											/>
											<div>
												<p className="font-medium text-green-200">
													{room.host_user.name}
												</p>
												<p className="text-xs text-green-400">
													{room.hasPassword
														? "🔒 パスワード有り"
														: "誰でも参加可能"}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											{room.character_list?.map((character) => (
												<div
													key={character.characterId}
													className="relative w-8 h-8"
												>
													<Image
														src={
															characterToImagePath(character.characterId) ||
															"/placeholder.svg"
														}
														alt={character.name}
														fill
														className="rounded-lg object-cover"
													/>
												</div>
											))}
										</div>
									</div>
								))
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
			</section>

			{/* キャラクター詳細モーダル */}
			<CharacterDetailModal
				character={detailCharacter}
				isOpen={isDetailModalOpen}
				onClose={() => setIsDetailModalOpen(false)}
			/>

			{/* パーティ作成モーダル */}
			<Dialog
				open={isCreatePartyModalOpen}
				onOpenChange={setIsCreatePartyModalOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>パーティルーム作成</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label>パスワード（任意）</Label>
							<Input
								type="password"
								placeholder="パーティルームのパスワード"
								value={partyPassword}
								onChange={(e) => setPartyPassword(e.target.value)}
							/>
							<p className="text-xs text-gray-400 mt-1">
								パスワードを設定しない場合は誰でも参加できます
							</p>
						</div>
						<Button onClick={createPartyRoom} className="w-full">
							作成
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* パーティルーム選択後のアクション部分を追加 */}
			{selectMode === "duo" && selectedRoom && (
				<div className="mt-auto pt-4 border-t border-green-400/30">
					<div className="flex gap-4 justify-around">
						<Button
							onClick={async () => {
								if (!user) return;
								// 既存のルームに参加
								const res = await fetch(
									`${process.env.NEXT_PUBLIC_BASE_URL}/api/duo-rooms/join`,
									{
										method: "POST",
										headers: {
											"Content-Type": "application/json",
											Authorization: `Bearer ${initialToken}`,
										},
										body: JSON.stringify({
											teamId: selectedRoom.id,
										}),
									},
								);
								if (res.ok) {
									const data = await res.json();
									router.push(`/duo-rooms/${data.id}`);
								}
							}}
							className="w-[calc(50%-10px)] bg-green-400 text-black hover:bg-green-500 text-sm h-9"
						>
							対戦ルームに参加 <ChevronRight className="ml-1 h-4 w-4" />
						</Button>
						<Button
							onClick={async () => {
								if (!user) return;
								// 新しいルームを作成
								const res = await fetch(
									`${process.env.NEXT_PUBLIC_BASE_URL}/api/duo-rooms/create`,
									{
										method: "POST",
										headers: {
											"Content-Type": "application/json",
											Authorization: `Bearer ${initialToken}`,
										},
										body: JSON.stringify({
											teamId: selectedRoom.id,
										}),
									},
								);
								if (res.ok) {
									const data = await res.json();
									router.push(`/duo-rooms/${data.id}`);
								}
							}}
							variant="outline"
							className="w-[calc(50%-10px)] bg-green-400 text-black hover:bg-green-500 text-sm h-9"
						>
							<Plus className="mr-1 h-4 w-4" /> 対戦ルーム作成
						</Button>
					</div>
				</div>
			)}

			{/* デュオ対戦ルーム一覧を表示するセクションを追加 */}
			{selectMode === "duo" && selectedRoom && (
				<div className="mt-4">
					<h3 className="text-lg font-bold text-green-400 flex items-center mb-4">
						<SwordsIcon className="mr-2 h-5 w-5" /> 参加可能な対戦ルーム
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{duoRooms.map((room) => (
							<div
								key={room.id}
								className="flex flex-col rounded-lg border p-4 bg-black/30 border-green-400/20"
							>
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center gap-2">
										<div className="flex -space-x-2">
											{room.teams.map((team) => (
												<Image
													key={team.id}
													src={team.host_user.photoUrl || "/placeholder.svg"}
													alt={team.host_user.name}
													width={32}
													height={32}
													className="rounded-full border-2 border-green-400/30"
												/>
											))}
										</div>
										<span className="text-green-200 text-sm">
											{room.teams[0].host_user.name}のチーム
										</span>
									</div>
								</div>
								<Button
									onClick={() => {
										// ルームに参加
									}}
									className="w-full bg-green-400 text-black hover:bg-green-500 text-sm"
								>
									参加する
								</Button>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

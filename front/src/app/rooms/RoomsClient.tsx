"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Users, ChevronRight, Cpu, Info, Minus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { characterToImagePath, cn } from "~/lib/utils";
import { useUserContext } from "~/context/UserProvider";
import type { Character } from "~/type/character";
import type { SelectingRoom } from "~/type/room";
import { FaLaptopCode } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { useUserCharacterList } from "~/hook/useUserCharacter";
import CharacterDetailModal from "./chara-modal";

type RoomsClientProps = {
	initialToken: string;
};

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

	return (
		<div className="container mx-auto p-4 flex flex-col h-screen max-h-screen">
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

				{/* キャラクター選択セクション */}
				<section className="flex-1">
					<div className="bg-gray-900/80 border border-green-400/30 rounded-lg p-4 h-full">
						<div className="mb-4">
							<h2 className="text-xl font-bold text-green-400 flex items-center">
								<FaLaptopCode className="mr-2" />
								技術選択
								<span className="text-sm ml-2 text-green-400/70">
									(最大3体)
								</span>
								<div className="h-px flex-grow ml-4 bg-gradient-to-r from-emerald-400 to-transparent" />
							</h2>
						</div>

						<div className="overflow-y-auto h-[calc(100%-4rem)] pr-2">
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
						</div>
					</div>
				</section>
			</div>

			{/* 対戦モード選択タブ */}
			<div className="flex mb-2 mt-4">
				<Button
					onClick={() => setShowCpuOptions(false)}
					className={cn(
						"mr-2 text-sm",
						!showCpuOptions
							? "bg-green-400 text-black hover:bg-green-500"
							: "bg-black/30 border-green-400/30 text-green-400 hover:bg-green-400/20",
					)}
				>
					<Users className="mr-2 h-4 w-4" /> 対人戦
				</Button>
				<Button
					onClick={toggleCpuOptions}
					className={cn(
						"text-sm",
						showCpuOptions
							? "bg-green-400 text-black hover:bg-green-500"
							: "bg-black/30 border-green-400/30 text-green-400 hover:bg-green-400/20",
					)}
				>
					<Cpu className="mr-2 h-4 w-4" /> CPU対戦
				</Button>
			</div>

			{/* ルーム選択またはCPU対戦セクション */}
			<section className="border border-green-400/30 rounded-lg p-3 backdrop-blur-sm backdrop-filter bg-black/20 flex-1 overflow-hidden">
				{showCpuOptions ? (
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
		</div>
	);
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Users, ChevronRight, Cpu } from "lucide-react";

import { Button } from "~/components/ui/button";
import { characterToImagePath, cn } from "~/lib/utils";
import { useUserContext } from "~/context/UserProvider";
import type { Character } from "~/type/character";
import type { SelectingRoom } from "~/type/room";
import { FaLaptopCode } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { useUserCharacterList } from "~/hook/useUserCharacter";

export default function GameInterface() {
	const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
	const [selectedRoom, setSelectedRoom] = useState<SelectingRoom | null>(null);
	const [rooms, setRooms] = useState<SelectingRoom[]>([]);
	const [showCpuOptions, setShowCpuOptions] = useState(false);

	const { user } = useUserContext();

	const router = useRouter();

	const { data: havingCharacters } = useUserCharacterList(
		user?.uid ?? null,
		user?.token ?? null,
	);

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

	const isButtonDisabled = selectedCharacters.length === 0;

	const createRoom = async () => {
		if (!user) return;
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/create`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
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
				headers: { "Content-Type": "application/json" },
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
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: user.uid, // userId に変更
					characterIdList: selectedCharacters.map((c) => c.characterId),
				}),
			},
		);
		const data = await res.json();
		if (res.ok) {
			enqueueSnackbar("CPU対戦を開始します", { variant: "success" });
			router.push(`/rooms/${data.id}`); // cpu-battle ではなく rooms に統一
		} else {
			enqueueSnackbar(data.message, { variant: "error" });
		}
	};

	useEffect(() => {
		const fetchRooms = async () => {
			const roomsRas = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms`,
			);
			const roomsData = await roomsRas.json();
			setRooms(roomsData);
		};

		fetchRooms(); // 初回フェッチ
	}, []);

	const refreshRooms = async () => {
		enqueueSnackbar("ルーム一覧を更新", {
			variant: "success",
		});
		const roomsRas = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms`,
		);
		const roomsData = await roomsRas.json();
		setRooms(roomsData);
	};

	return (
		<div className="h-screen bg-gray-900 text-white p-3 flex flex-col overflow-hidden pl-20">
			{/* 技術選択セクション */}
			<section className="border border-green-400/30 rounded-lg p-3 backdrop-blur-sm backdrop-filter bg-black/20 h-[55%] overflow-hidden mb-3">
				<h2 className="text-lg font-bold mb-2 text-green-400 flex items-center">
					<FaLaptopCode className="mr-2 h-5 w-5" /> 技術選択
					<span className="text-sm ml-2 text-green-400/70">(最大3体)</span>
				</h2>

				<div className="grid grid-cols-2 gap-3 h-[calc(100%-30px)]">
					{/* 選択された技術 */}
					<div className="space-y-1 overflow-auto">
						<h3 className="text-xs font-semibold text-green-400/80">
							選択中の技術
						</h3>
						<div className="h-[calc(100%-22px)] border border-green-400/20 rounded-lg p-2 bg-black/30 overflow-auto">
							{selectedCharacters.length === 0 ? (
								<div className="h-full flex items-center justify-center text-gray-500">
									<p>技術が選択されていません</p>
								</div>
							) : (
								selectedCharacters.map((character) => (
									<div
										key={character.characterId}
										className="flex h-[calc(33.33%-6px)] items-center p-1.5 rounded-md bg-green-400/10 border border-green-400/30 hover:bg-green-400/20 transition-all cursor-pointer mb-2 last:mb-0"
										onClick={() => handleSelectCharacter(character)}
									>
										<div className="relative h-16 w-16 mx-3 rounded-md overflow-hidden border border-green-400/50">
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
										<div>
											<h5 className="font-bold text-green-400">
												{character.name}
											</h5>
											<p className="text-xs font-bold text-green-400/70">
												レベル {character.level}
											</p>
										</div>
										<div className="flex justify-around items-center ml-auto gap-4">
											<h5 className="font-bold text-green-400 text-xs">
												HP {character.life}
											</h5>
											<h5 className="font-bold text-green-400 text-xs">
												パワー {character.power}
											</h5>
											<h5 className="font-bold text-green-400 text-xs">
												スピード {character.speed}
											</h5>
											<h5 className="font-bold text-green-400 text-xs">
												回避率 {character.baseEvasion}%
											</h5>
										</div>
										<div className="ml-auto">
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 rounded-full text-red-400 hover:text-red-300 hover:bg-red-400/10"
											>
												<Plus className="rotate-45 h-4 w-4" />
											</Button>
										</div>
									</div>
								))
							)}
						</div>
					</div>

					{/* 技術一覧 */}
					<div className="space-y-1 overflow-hidden">
						<h3 className="text-xs font-semibold text-green-400/80">
							利用可能な技術
						</h3>
						<div className="h-[calc(100%-22px)] overflow-auto pb-2">
							<div className="flex flex-wrap gap-3 content-start">
								{havingCharacters &&
									havingCharacters.map((character) => (
										<div
											key={character.characterId}
											className={cn(
												"flex flex-col justify-center items-center p-1.5 rounded-lg border transition-all cursor-pointer h-[150px] w-[150px]",
												selectedCharacters.find(
													(c) => c.characterId === character.characterId,
												)
													? "bg-green-400/20 border-green-400"
													: "bg-black/30 border-green-400/20 hover:bg-green-400/10",
											)}
											onClick={() => handleSelectCharacter(character)}
										>
											<div className="relative h-12 w-12 mb-1 rounded-full overflow-hidden border-2 border-green-400/50">
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
											<h4 className="font-bold text-center text-green-400 text-sm">
												{character.name}
											</h4>
											<p className="text-xs text-green-400/70">
												レベル {character.level}
											</p>
										</div>
									))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* 対戦モード選択タブ */}
			<div className="flex mb-2">
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
			<section className="border border-green-400/30 rounded-lg p-3 backdrop-blur-sm backdrop-filter bg-black/20 h-[38%] overflow-hidden">
				{showCpuOptions ? (
					<div className="space-y-4 h-[calc(100%-40px)] flex flex-col justify-center">
						{/* <div className="bg-black/30 border border-green-400/20 rounded-lg p-4">
							<h3 className="text-sm font-semibold text-green-400/80 mb-2">
								CPU対戦情報
							</h3>
							<p className="text-xs text-green-400/70 mb-1">
								CPUと思う存分対戦しよう！
							</p>
							<p className="text-xs text-green-400/70">
								※ CPU対戦ではレベル経験値が通常の80%になります
							</p>
						</div> */}

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
		</div>
	);
}

"use client";

import { useEffect, useState } from "react";
import { BotIcon, Loader2Icon, Plus, UserIcon } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import { RoomRefreshButton } from "./RoomRefreshButton";
import { handleRefresh } from "./actions";
import { useRooms } from "../_hooks/useRoomList";
import Link from "next/link";

type Props = {
	token: string;
	user: {
		id: string;
		name: string;
		photoUrl?: string | null;
	};
};

export const RoomListSectionContainerContent = ({ user, token }: Props) => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	// const [rooms, setRooms] = useState<any[]>([]);

	// const isButtonDisabled = !(searchParams.get("chars")?.length > 0);

	const { rooms } = useRooms(token);

	console.info("rooms", rooms);

	// useEffect(() => {
	// 	const fetchRooms = async () => {
	// 		const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms`, {
	// 			headers: {
	// 				Authorization: `Bearer ${token}`,
	// 			},
	// 			cache: "no-store",
	// 		});
	// 		const data = await res.json();
	// 		setRooms(data);
	// 	};

	// 	fetchRooms();
	// }, [token]);

	const charsParam = searchParams.get("chars");
	const characterIdList =
		charsParam
			?.split(",")
			.map((id) => id.trim())
			.filter((id) => id !== "") ?? [];

	console.info("user", user);

	const createRoom = async () => {
		if (!user || characterIdList.length === 0) return;

		setIsLoading(true);
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/create`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						hostUserId: user.id,
						characterIdList,
					}),
				},
			);

			const data = await res.json();
			router.push(`/rooms/${data.id}`);
		} catch (e) {
			console.error("ルーム作成エラー:", e);
		} finally {
			setIsLoading(false);
		}
	};

	const joinRoom = async (room: {
		id: string;
		host_user: { id: string; name: string; photoUrl?: string | null };
	}) => {
		if (!user) return;
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/join`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					roomId: room?.id,
					characterIdList: characterIdList,
					guestUserId: user.id,
				}),
			},
		);

		const data = await res.json();
		router.push(`/rooms/${room?.id}`);
	};

	return (
		<>
			<div className="flex justify-between items-center">
				<div className="flex mb-2 gap-2">
					<Button
						onClick={handleRefresh}
						className="bg-green-400 text-black hover:bg-green-500 text-sm cursor-pointer"
					>
						更新
					</Button>

					<Button className="text-sm bg-black/30 border-green-400/30 text-green-400 hover:bg-green-400/20 cursor-pointer">
						<BotIcon className="h-4 w-4" /> CPU対戦
					</Button>

					{/* TODO: 一旦コメントアウト */}
					{/* <Link
						href="/duoRooms"
						className="text-sm bg-black/30 border-green-400/30 text-green-400 hover:bg-green-400/20 flex items-center justify-center"
					>
						デュオ対戦
					</Link> */}

					<Button
						onClick={createRoom}
						variant="outline"
						className="w-[calc(50%-10px)] bg-green-400 text-black hover:bg-green-500 text-sm h-9 cursor-pointer"
						disabled={characterIdList.length === 0 || isLoading}
					>
						{isLoading ? (
							<>
								<Loader2Icon className="mr-1 h-4 w-4 animate-spin" /> 作成中…
							</>
						) : (
							<>
								<Plus className="mr-1 h-4 w-4" /> ルーム作成
							</>
						)}
						{/* <Plus className="mr-1 h-4 w-4" /> ルーム作成 */}
					</Button>
				</div>
			</div>

			<div
				className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto"
				style={{ maxHeight: "calc(100vh - 400px)" }}
			>
				{rooms
					.filter(
						(room: {
							id: string;
							host_user: { id: string; name: string; photoUrl?: string | null };
							guest_user: { id: string } | null;
						}) => room.guest_user === null && room.host_user.id !== user?.id,
					)
					.map(
						(room: {
							id: string;
							host_user: { id: string; name: string; photoUrl?: string | null };
						}) => (
							<div
								onKeyDown={() => {}}
								key={room.id}
								className="flex flex-col rounded-lg border transition-all justify-center items-center cursor-pointer min-w-[200px] min-h-[160px] overflow-hidden bg-black/30 border-green-400/20 hover:bg-green-400/10"
								role="button"
								onClick={() => joinRoom(room)}
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
						),
					)}
			</div>
		</>
	);
};

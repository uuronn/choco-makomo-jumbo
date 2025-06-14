"use client";

import { useEffect, useState } from "react";
import { useUserContext } from "~/context/UserProvider";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import type { Team, TeamRoom } from "~/type/team";
import { Users, Plus, ChevronRight } from "lucide-react";
import Image from "next/image";

type TeamRoomsClientProps = {
	initialToken: string;
};

export function TeamRoomsClient({ initialToken }: TeamRoomsClientProps) {
	const [rooms, setRooms] = useState<TeamRoom[]>([]);
	const [selectedRoom, setSelectedRoom] = useState<TeamRoom | null>(null);
	const [myTeam, setMyTeam] = useState<Team | null>(null);

	const { user } = useUserContext();
	const router = useRouter();

	// チーム対戦ルーム作成
	const createRoom = async () => {
		if (!user || !myTeam) return;
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/team-rooms/create`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${initialToken}`,
					},
					body: JSON.stringify({
						teamId: myTeam.id,
						userId: user.uid,
					}),
				},
			);
			const data = await res.json();
			if (res.ok) {
				router.push(`/team-rooms/${data.id}`);
				enqueueSnackbar("対戦ルームを作成しました", { variant: "success" });
			} else {
				enqueueSnackbar(data.message, { variant: "error" });
			}
		} catch (e) {
			enqueueSnackbar("ルーム作成に失敗しました", { variant: "error" });
		}
	};

	// チーム対戦ルーム参加
	const joinRoom = async () => {
		if (!user || !myTeam || !selectedRoom) return;
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/team-rooms/${selectedRoom.id}/join`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${initialToken}`,
					},
					body: JSON.stringify({
						teamId: myTeam.id,
						userId: user.uid,
					}),
				},
			);
			const data = await res.json();
			if (res.ok) {
				router.push(`/team-rooms/${selectedRoom.id}`);
				enqueueSnackbar("対戦ルームに参加しました", { variant: "success" });
			} else {
				enqueueSnackbar(data.message, { variant: "error" });
			}
		} catch (e) {
			enqueueSnackbar("ルーム参加に失敗しました", { variant: "error" });
		}
	};

	// 自分のチーム情報取得
	useEffect(() => {
		if (!user) return;
		const fetchMyTeam = async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/teams/my-team`,
					{
						headers: {
							Authorization: `Bearer ${initialToken}`,
						},
					},
				);
				if (res.ok) {
					const data = await res.json();
					setMyTeam(data);
				}
			} catch (e) {
				console.error("チーム情報の取得に失敗しました", e);
			}
		};

		fetchMyTeam();
		const interval = setInterval(fetchMyTeam, 3000);
		return () => clearInterval(interval);
	}, [user, initialToken]);

	// ルーム一覧取得
	useEffect(() => {
		const fetchRooms = async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/team-rooms`,
					{
						headers: {
							Authorization: `Bearer ${initialToken}`,
						},
					},
				);
				const data = await res.json();
				setRooms(data);
			} catch (e) {
				console.error("ルーム一覧の取得に失敗しました", e);
			}
		};

		fetchRooms();
		const interval = setInterval(fetchRooms, 3000);
		return () => clearInterval(interval);
	}, [initialToken]);

	if (!myTeam) {
		return (
			<div className="text-center text-green-400">
				<p>チームに所属していません</p>
				<Button
					onClick={() => router.push("/teams")}
					className="mt-4 bg-green-400 text-black hover:bg-green-500"
				>
					チームページへ
				</Button>
			</div>
		);
	}

	if (myTeam.status !== "ready") {
		return (
			<div className="text-center text-green-400">
				<p>チームの準備が完了していません</p>
				<Button
					onClick={() => router.push("/teams")}
					className="mt-4 bg-green-400 text-black hover:bg-green-500"
				>
					チームページへ
				</Button>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-4">
			<div className="mb-8">
				<h2 className="text-xl font-bold text-green-400 mb-4">
					対戦ルーム作成/参加
				</h2>
				<div className="flex gap-4">
					<Button
						onClick={createRoom}
						className="bg-green-400 text-black hover:bg-green-500"
					>
						<Plus className="mr-2" /> ルーム作成
					</Button>
					<Button
						onClick={joinRoom}
						className="bg-green-400 text-black hover:bg-green-500"
						disabled={!selectedRoom}
					>
						参加 <ChevronRight className="ml-2" />
					</Button>
				</div>
			</div>

			<div>
				<h2 className="text-xl font-bold text-green-400 mb-4">
					参加可能なルーム
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{rooms.map((room) => (
						<div
							key={room.id}
							className={`p-4 rounded-lg border cursor-pointer ${
								selectedRoom?.id === room.id
									? "border-green-400 bg-green-400/20"
									: "border-green-400/30 hover:bg-green-400/10"
							}`}
							onClick={() => setSelectedRoom(room)}
						>
							<div className="flex items-center gap-4">
								<Image
									src={room.team1.leaderUser.photoUrl || "/placeholder.svg"}
									alt={room.team1.leaderUser.name}
									width={48}
									height={48}
									className="rounded-full"
								/>
								<div>
									<p className="font-bold text-green-400">
										{room.team1.leaderUser.name}のチーム
									</p>
									<p className="text-sm text-green-400/70">対戦相手募集中</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

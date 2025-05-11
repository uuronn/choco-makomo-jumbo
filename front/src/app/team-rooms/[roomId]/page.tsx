"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUserContext } from "~/context/UserProvider";
import Loading from "~/components/Loading";
import type { TeamRoom } from "~/type/team";
import TeamBattle from "~/components/TeamBattle";
import TeamVictory from "~/components/TeamVictory";
import TeamDefeat from "~/components/TeamDefeat";
import TeamPending from "~/components/TeamPending";
import TeamJoinLoading from "~/components/TeamJoinLoading";
import TeamCreateLoading from "~/components/TeamCreateLoading";

export default function TeamRoomDetailPage() {
	const { user } = useUserContext();
	const { roomId } = useParams();
	const [room, setRoom] = useState<TeamRoom | null>(null);
	const router = useRouter();

	useEffect(() => {
		if (!roomId || !user) return;

		const fetchRoom = async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/team-rooms/${user.uid}/${roomId}/status`,
					{
						headers: { "Content-Type": "application/json" },
					},
				);
				const data = await res.json();

				if (
					data.message === "このルームにアクセスする権限がありません" ||
					data.message === "ルームが見つかりません"
				) {
					router.push("/team-rooms");
					return;
				}

				setRoom(data);
			} catch (e) {
				console.error(e);
			}
		};

		fetchRoom();
		const interval = setInterval(fetchRoom, 1000);
		return () => clearInterval(interval);
	}, [roomId, user, router]);

	if (!user) return <Loading message="認証中" />;
	if (!room) return <Loading message="ルーム情報取得中" />;

	// ユーザーがどちらのチームに所属しているか判定
	const isTeam1Member =
		room.team1.leaderUserId === user.uid ||
		room.team1.memberUserId === user.uid;
	const isTeam2Member =
		room.team2 &&
		(room.team2.leaderUserId === user.uid ||
			room.team2.memberUserId === user.uid);
	const myTeam = isTeam1Member ? room.team1 : room.team2;
	const isLeader = myTeam?.leaderUserId === user.uid;

	if (room.status === "waiting") {
		return <TeamCreateLoading message="対戦相手を待っています" />;
	}

	if (room.status === "pending" && isTeam1Member && isLeader) {
		return <TeamPending room={room} setRoom={setRoom} />;
	}

	if (room.status === "pending" && isTeam2Member) {
		return <TeamJoinLoading message="承認待ち" />;
	}

	if (room.status === "battling") {
		return <TeamBattle room={room} />;
	}

	const isWinner = room.winTeamId === myTeam?.id;
	return isWinner ? <TeamVictory room={room} /> : <TeamDefeat room={room} />;
}

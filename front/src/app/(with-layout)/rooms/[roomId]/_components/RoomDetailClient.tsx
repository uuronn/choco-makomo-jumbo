"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Loading from "~/components/Loading";
import Pending from "~/components/Pending";
import type { Room } from "~/type/room";
import Battle from "~/components/Battle";
import Victory from "~/components/Victory";
import Defeat from "~/components/Defeat";
import JoinLoading from "~/components/JoinLoading";
import CreateLoading from "~/components/CreateLoading";

type Props = {
	user: { id: string; name: string } | null;
};

export default function RoomDetailClient({ user }: Props) {
	const { roomId } = useParams();
	const [room, setRoom] = useState<Room | null>(null);
	const router = useRouter();

	useEffect(() => {
		if (!roomId || !user) return;

		const fetchRoom = async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/${user.id}/${roomId}/status`,
					{
						headers: { "Content-Type": "application/json" },
					},
				);
				const data = await res.json();

				if (
					data.message === "このルームにアクセスする権限がありません" ||
					data.message === "指定されたルームが見つかりません"
				) {
					router.push("/rooms");
					return;
				}
				if (data.status === "finish") {
					clearInterval(interval);
					setRoom((prevRoom) => ({
						...prevRoom,
						...data,
						status: "battling",
						currentTurnUserId: null,
					}));
					setTimeout(() => {
						setRoom(data);
					}, 2000);
				} else {
					setRoom(data);
				}
			} catch (e) {
				console.log(e);
			}
		};
		fetchRoom();

		const interval = setInterval(fetchRoom, 1000);
		return () => clearInterval(interval);
	}, [roomId, user, router]);

	// ルーム作成のキャンセル処理
	const handleCancelCreate = async () => {
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/${roomId}/cancelCreate`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ hostUserId: user?.id }),
				},
			);
			const data = await res.json();
			if (res.ok) {
				router.push("/rooms"); // ルーム一覧に戻る
			} else {
				console.error(data.message);
			}
		} catch (e) {
			console.error("キャンセルに失敗しました", e);
		}
	};

	// キャンセル処理
	const handleCancelJoin = async () => {
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/${roomId}/cancel`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ guestUserId: user?.id }),
				},
			);
			const data = await res.json();
			if (res.ok) {
				setRoom(data); // ルーム状態を更新
				router.push("/rooms"); // ルーム一覧に戻る（任意）
			} else {
				console.error(data.message);
			}
		} catch (e) {
			console.error("キャンセルに失敗しました", e);
		}
	};

	if (!user) return <Loading message="認証中" />;
	if (room == null) return <Loading message="ルーム情報取得中" />;
	return room.status === "waiting" ? (
		<CreateLoading
			message="マッチング中"
			handleCancelCreate={handleCancelCreate}
		/>
	) : room.status === "pending" && room.hostUserId === user.id ? (
		<Pending room={room} setRoom={setRoom} user={user} />
	) : room.status === "pending" && room.hostUserId !== user.id ? (
		<JoinLoading message="参加中" handleCancelJoin={handleCancelJoin} />
	) : room.status === "battling" ? (
		<Battle room={room} user={user} />
	) : room.status === "finish" && room.winUserId === user.id ? (
		<Victory room={room} />
	) : (
		<Defeat room={room} />
	);
}

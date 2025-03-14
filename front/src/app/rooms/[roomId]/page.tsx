"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // Next.js 13 以降の useRouter
import { useAuth } from "../../context/AuthProvider";
import Link from "next/link";

export default function RoomDetailPage() {
	const { user } = useAuth();
	const { roomId } = useParams();
	const router = useRouter();

	console.info("room_id", roomId);

	const [room, setRoom] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!roomId || !user) return;

		// ルーム情報を取得
		const fetchRoom = async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/${roomId}`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ user_id: user.uid }),
					},
				);

				if (!res.ok) {
					const errorData = await res.json();
					throw new Error(errorData.message || "ルームの取得に失敗しました");
				}

				const data = await res.json();
				setRoom(data.room);
			} catch (err: any) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchRoom();

		// リアルタイムでルームの状態を監視（バトル開始時の自動遷移）
		const interval = setInterval(fetchRoom, 3000); // 3秒ごとにチェック

		return () => clearInterval(interval);
	}, [roomId, user]);

	// バトルが開始されたらバトル画面へ遷移
	useEffect(() => {
		if (room?.status === "battling") {
			router.push(`/battle/${roomId}`);
		}
	}, [room, router, roomId]);

	// バトル開始（ホストのみ実行可能）
	const startBattle = async () => {
		if (!user) return;

		if (!room || room.host_user_id !== user.uid) {
			alert("ホストのみがバトルを開始できます");
			return;
		}

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/start-battle`,
			{
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ room_id: room.id, user_id: user.uid }),
			},
		);

		if (!res.ok) {
			alert("バトル開始に失敗しました");
			console.error(await res.json());
			return;
		}

		// バトル開始時に即時画面遷移
		router.push(`/battle/${roomId}`);
	};

	if (!user) return <p>...loading</p>;
	if (loading) return <p>ルーム情報を取得中...</p>;
	if (error) return <p className="text-red-500">{error}</p>;
	if (!room) return <p>ルームが見つかりません</p>;

	console.info("room", room);

	return (
		<div className="min-h-screen text-black flex flex-col items-center justify-center bg-gray-100 p-4">
			<h1 className="text-3xl font-bold mb-6">ルーム詳細</h1>

			<div className="bg-white p-6 rounded-md shadow-md w-full max-w-md">
				<p>
					<strong>ルームID:</strong> {room.id}
				</p>
				<p>
					<strong>ホスト:</strong> {room.host_user_id}
				</p>
				<p>
					<strong>ゲスト:</strong> {room.guest_user_id || "未参加"}
				</p>
				<p>
					<strong>ステータス:</strong> {room.status}
				</p>
			</div>

			{/* バトル開始ボタン（ホストのみ表示） */}
			{room.status === "ready" && user?.uid === room.host_user_id && (
				<button
					type="button"
					className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
					onClick={startBattle}
				>
					バトルを開始する
				</button>
			)}

			{/* 既にバトルが開始している場合 */}
			{room.status === "battling" && (
				<Link
					href={`/battle/${roomId}`}
					className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md"
				>
					バトル画面へ進む
				</Link>
			)}

			<Link href="/" className="mt-4 text-blue-500">
				戻る
			</Link>
		</div>
	);
}

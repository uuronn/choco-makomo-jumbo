"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Next.js 13 以降の useRouter
import { useAuth } from "../../context/AuthProvider";
import Link from "next/link";

export default function RoomDetailPage({
	params,
}: { params: { room_id: string } }) {
	const router = useRouter();
	const { user } = useAuth();
	const { room_id } = params;

	const [room, setRoom] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!room_id || !user) return;

		(async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/${room_id}`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ user_id: user.id }),
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
		})();
	}, [room_id, user]);

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

			{/* {room.status === "waiting" && !room.guest_user_id && (
				<button
					className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
					onClick={async () => {
						try {
							const res = await fetch(
								`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/join`,
								{
									method: "POST",
									headers: { "Content-Type": "application/json" },
									body: JSON.stringify({
										room_id,
										guest_user_id: user.id,
									}),
								},
							);

							if (!res.ok) {
								throw new Error("ルーム参加に失敗しました");
							}

							const data = await res.json();
							setRoom(data.room);
						} catch (error) {
							console.error(error);
						}
					}}
				>
					ルームに参加する
				</button>
			)} */}

			<Link href="/" className="mt-4 text-blue-500">
				戻る
			</Link>
		</div>
	);
}

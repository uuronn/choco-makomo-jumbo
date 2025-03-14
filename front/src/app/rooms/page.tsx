"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { p } from "framer-motion/client";
import Link from "next/link";

export default function RoomListPage() {
	const { user } = useAuth();

	const [roomList, serRoomList] = useState<any>([]);

	useEffect(() => {
		if (user) {
			(async () => {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms`,
				);

				if (!res.ok) {
					throw new Error("ルームの取得に失敗しました");
				}

				const data = await res.json();
				serRoomList(data.rooms);
			})();
		}
	}, [user]);

	if (!user) return <p>...loading</p>;

	return (
		<div className="min-h-screen text-black flex flex-col items-center justify-center bg-gray-100 p-4">
			<h1 className="text-3xl font-bold mb-6">ルーム一覧</h1>
			{roomList.map((room) => (
				<Link
					href={`/rooms/${room.id}`}
					key={room.id}
					className="bg-white p-4 rounded-md shadow-md mb-4"
				>
					<p>{room.id}</p>
				</Link>
			))}
		</div>
	);
}

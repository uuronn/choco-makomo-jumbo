"use client";

import Link from "next/link";
import { useAuth } from "./context/AuthProvider";

export default function HomePage() {
	const { handleSignOut, user } = useAuth();

	if (!user) return <p>...loading</p>;

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<h1 className="text-2xl font-bold">Dashboard</h1>
			<p>{user.displayName}</p>

			<Link href="/rooms">ルーム一覧</Link>

			<Link href="/characters">キャラ一覧</Link>

			<Link href="/gacha">ガチャ</Link>

			<button type="button" onClick={handleSignOut} className="mt-4">
				Logout
			</button>
		</div>
	);
}

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "~/app/context/AuthProvider";
import { useRouter } from "next/navigation";

export default function GachaPage() {
	const { user } = useAuth();
	const router = useRouter();

	// ガチャ結果の状態
	const [gachaResult, setGachaResult] = useState<any>(null);
	const [loading, setLoading] = useState(false);

	// 未ログインならサインインページにリダイレクト
	useEffect(() => {
		if (user === null) {
			router.push("/auth/signIn");
		}
	}, [user, router]);

	// ガチャを引く処理
	const pullGacha = async () => {
		if (!user) return;

		setLoading(true);

		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${user.uid}/gacha`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
				},
			);

			if (!res.ok) {
				throw new Error("ガチャの取得に失敗しました");
			}

			const data = await res.json();
			setGachaResult(data);
		} catch (error) {
			console.error(error);
			alert("ガチャを引けませんでした");
		} finally {
			setLoading(false);
		}
	};

	if (!user) return;

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
			{user.displayName}
			<h1 className="text-3xl font-bold mb-6 text-black">ガチャページ</h1>

			<button
				type="button"
				onClick={pullGacha}
				className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
				disabled={loading}
			>
				{loading ? "ガチャを引いています..." : "ガチャを引く！"}
			</button>

			{/* ガチャ結果を表示 */}
			{gachaResult && (
				<div className="mt-6 p-4 bg-white rounded-lg shadow">
					<p>引いたキャラ: {gachaResult.characterName}</p>
					<p>レア度: {gachaResult.rarity}</p>
				</div>
			)}
		</div>
	);
}

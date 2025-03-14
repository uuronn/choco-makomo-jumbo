"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
	const [battleLog, setBattleLog] = useState<string[]>([]);
	const [battleState, setBattleState] = useState<
		"idle" | "in_progress" | "finished"
	>("idle");
	const [winner, setWinner] = useState<string | null>(null);

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

		// バトル開始したら simulate-battle を叩く
		runBattle();
	};

	// バトル進行処理（サーバーでバトルをシミュレート）
	const runBattle = async () => {
		if (!room) return;

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/simulate-battle`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ room_id: room.id }),
			},
		);

		if (!res.ok) {
			alert("バトルの進行に失敗しました");
			console.error(await res.json());
			return;
		}

		const data = await res.json();
		setBattleLog(data.log);
		setWinner(data.winner);
		setBattleState("finished");

		// バトル結果を保存
		saveBattleResult(data.winner);
	};

	// バトル結果を保存
	const saveBattleResult = async (winner: string) => {
		await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/end-battle`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ room_id: room.id, winner }),
		});
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

			{/* バトル進行ログ */}
			{battleState !== "idle" && (
				<div className="bg-gray-800 text-white p-4 rounded-md mt-6 w-full max-w-md">
					<h2 className="text-xl font-bold">バトルログ</h2>
					{battleLog.map((log, index) => (
						<p key={index}>{log}</p>
					))}
				</div>
			)}

			{/* バトル結果 */}
			{battleState === "finished" && (
				<div className="bg-green-500 text-white p-4 rounded-md mt-6">
					<h2 className="text-xl font-bold">バトル終了</h2>
					<p>勝者: {winner === "host" ? "ホスト" : "ゲスト"}</p>
				</div>
			)}

			<Link href="/" className="mt-4 text-blue-500">
				戻る
			</Link>
		</div>
	);
}

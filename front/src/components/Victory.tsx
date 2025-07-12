"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Trophy, HomeIcon, TrendingUp, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import { LuSwords } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { useUserContext } from "~/context/UserProvider";
import type { Room } from "~/type/room";
import { useUser } from "~/hook/useUser";
import Loading from "./Loading";

export default function Victory({
	room,
	user,
}: { room: Room; user: { id: string; name: string; rating: number } | null }) {
	const [showScreen, setShowScreen] = useState(false);
	const [showRateIncrease, setShowRateIncrease] = useState(false);
	const [currentRate, setCurrentRate] = useState(0);
	const [previousRate, setPreviousRate] = useState(0);
	const [rateIncrease, setRateIncrease] = useState(0);
	const [animationComplete, setAnimationComplete] = useState(false);
	const sparklesRef = useRef<HTMLDivElement>(null);
	// const { user: authUser } = useUserContext();

	const router = useRouter();

	// const {
	// 	data: user,
	// 	error,
	// 	isLoading,
	// 	mutate,
	// } = useUser(authUser?.uid ?? null);

	// レートポイントのカウントアップアニメーション
	useEffect(() => {
		if (!showRateIncrease) return;

		// 仮のレート増加値（APIから取得するか、roomオブジェクトから取得する）
		const baseRate = user?.rating || 1000; // ユーザーの現在のレート
		const increase = 15; // 勝利による増加ポイント

		setPreviousRate(baseRate);
		setRateIncrease(increase);
		setCurrentRate(baseRate);

		// カウントアップアニメーション
		const startValue = baseRate;
		const endValue = baseRate + increase;
		const duration = 2000; // 2秒間
		const startTime = Date.now();

		const animateCount = () => {
			const now = Date.now();
			const elapsed = now - startTime;
			const progress = Math.min(elapsed / duration, 1);

			// イージング関数で滑らかに
			const easeOutQuart = 1 - Math.pow(1 - progress, 4);
			const currentValue = Math.floor(startValue + increase * easeOutQuart);

			setCurrentRate(currentValue);

			if (progress < 1) {
				requestAnimationFrame(animateCount);
			} else {
				setAnimationComplete(true);
			}
		};

		requestAnimationFrame(animateCount);

		// キラキラエフェクトを追加
		const createSparkles = () => {
			if (!sparklesRef.current) return;

			const sparkle = document.createElement("div");
			sparkle.className =
				"absolute w-2 h-2 bg-yellow-300 rounded-full animate-sparkle";

			// ランダムな位置
			const top = Math.random() * 100;
			const left = Math.random() * 100;
			sparkle.style.top = `${top}%`;
			sparkle.style.left = `${left}%`;

			sparklesRef.current.appendChild(sparkle);

			// 一定時間後に削除
			setTimeout(() => {
				sparkle.remove();
			}, 1000);
		};

		const sparkleInterval = setInterval(createSparkles, 100);

		return () => {
			clearInterval(sparkleInterval);
		};
	}, [showRateIncrease, user]);

	useEffect(() => {
		// Trigger animations in sequence
		setTimeout(() => setShowScreen(true), 100);
		setTimeout(() => {
			// Trigger confetti
			confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.6 },
				colors: ["#10B981", "#059669", "#34D399", "#A7F3D0"],
			});
		}, 600);

		// レートアップ演出を少し遅らせて表示
		setTimeout(() => {
			setShowRateIncrease(true);
		}, 1200);
		(async () => {
			await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/${room.hostUserId}/${room.id}/delete`,
				{
					method: "DELETE",
				},
			);
		})();
	}, [room.hostUserId, room.id]);

	// 👇 データの状態を見てレンダリングを制御
	// if (!authUser) return <Loading message="認証中" />;
	// if (isLoading) return <Loading message="ユーザー情報を取得中" />;

	// if (!user || error) return <div>エラー: {error.message}</div>;

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
			<style jsx global>{`
        @keyframes sparkle {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            filter: drop-shadow(0 0 5px rgba(252, 211, 77, 0.7));
          }
          50% {
            filter: drop-shadow(0 0 15px rgba(252, 211, 77, 1));
          }
        }
        
        .animate-sparkle {
          animation: sparkle 1s forwards;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s infinite;
        }
      `}</style>

			<div className="absolute inset-0 overflow-hidden">
				{/* Cyber grid background */}
				<div className="absolute inset-0 z-0 opacity-20">
					<div className="h-full w-full bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
				</div>

				{/* Glowing orbs in background */}
				<div className="absolute left-1/4 top-1/4 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-3xl"></div>
				<div className="absolute bottom-1/4 right-1/4 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-3xl"></div>
			</div>

			<Card
				className={`relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-emerald-500/20 bg-black/80 p-6 shadow-[0_0_15px_rgba(16,185,129,0.5)] backdrop-blur-sm transition-all duration-500 ${
					showScreen ? "scale-100 opacity-100" : "scale-90 opacity-0"
				}`}
			>
				<div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-emerald-500/30 blur-3xl"></div>
				<div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-emerald-500/30 blur-3xl"></div>

				{/* Victory header */}
				<div className="mb-6 text-center">
					<div className="mb-2 flex justify-center">
						<Trophy className="h-12 w-12 text-emerald-400" />
					</div>
					<h1 className="text-center font-mono text-4xl font-bold uppercase tracking-wider text-white">
						<span className="mr-2 inline-block animate-pulse text-emerald-400">
							[
						</span>
						VICTORY
						<span className="ml-2 inline-block animate-pulse text-emerald-400">
							]
						</span>
					</h1>
					<div className="mt-2 text-emerald-400">勝利</div>
				</div>

				{/* レートアップ表示 */}
				<div
					className={`relative mb-8 overflow-hidden rounded-lg border border-emerald-500/30 bg-black/50 p-4 transition-all duration-700 ${
						showRateIncrease
							? "opacity-100 translate-y-0"
							: "opacity-0 translate-y-10"
					}`}
					ref={sparklesRef}
				>
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5 text-yellow-400" />
							<span className="text-emerald-200">レートポイント</span>
						</div>
					</div>

					{/* レート変化の表示 */}
					<div className="flex items-center justify-center gap-3 my-4">
						<div className="text-xl font-bold text-white">{previousRate}</div>
						<div className="flex flex-col items-center">
							<ArrowRight className="h-6 w-6 text-yellow-400" />
							{/* 増加分の表示 - 常に表示されるようにする */}
							<div
								className={`text-yellow-400 font-bold ${
									animationComplete ? "animate-pulse-glow" : ""
								}`}
							>
								+{rateIncrease}
							</div>
						</div>
						<div className="text-xl font-bold text-emerald-300">
							{currentRate}
						</div>
					</div>

					{/* プログレスバー */}
					<div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-800">
						<div
							className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all duration-1000"
							style={{
								width: showRateIncrease ? "100%" : "0%",
								transition: "width 2s cubic-bezier(0.34, 1.56, 0.64, 1)",
							}}
						></div>
					</div>

					{/* 増加分の説明 */}
					<div className="mt-3 text-center text-sm text-emerald-200/80">
						勝利ボーナス: +{rateIncrease}ポイント獲得!
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<Button
						onClick={() => {
							router.push("/rooms");
						}}
						className="cursor-pointer border border-emerald-500/30 bg-transparent text-emerald-400 hover:bg-emerald-500/10"
					>
						<LuSwords className="mr-2 h-4 w-4" />
						対戦へ
					</Button>
					<Button
						onClick={() => {
							router.push("/");
						}}
						className="cursor-pointer border border-emerald-500/30 bg-transparent text-emerald-400 hover:bg-emerald-500/10"
					>
						<HomeIcon className="mr-2 h-4 w-4" />
						ホームへ
					</Button>
				</div>

				{/* Cyber decorative elements */}
				{/* <div className="absolute bottom-0 left-0 h-1 w-1/3 bg-gradient-to-r from-emerald-500 to-transparent"></div>
				<div className="absolute right-0 top-0 h-1 w-1/3 bg-gradient-to-l from-emerald-500 to-transparent"></div>
				<div className="absolute bottom-6 right-6 h-20 w-1 animate-pulse bg-emerald-500/50"></div>
				<div className="absolute left-6 top-6 h-1 w-20 animate-pulse bg-emerald-500/50"></div> */}
			</Card>
		</div>
	);
}

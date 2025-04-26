"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Skull, HomeIcon, TrendingDown, ArrowRight } from "lucide-react";
import { LuSwords } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { useUserContext } from "~/context/UserProvider";
import type { Room } from "~/type/room";

export default function Defeat({ room }: { room: Room }) {
	const [showScreen, setShowScreen] = useState(false);
	const [showRateDecrease, setShowRateDecrease] = useState(false);
	const [currentRate, setCurrentRate] = useState(0);
	const [previousRate, setPreviousRate] = useState(0);
	const [rateDecrease, setRateDecrease] = useState(0);
	const [animationComplete, setAnimationComplete] = useState(false);
	const glitchRef = useRef<HTMLDivElement>(null);
	const { user } = useUserContext();

	const router = useRouter();

	// レートポイントのカウントダウンアニメーション
	useEffect(() => {
		if (!showRateDecrease) return;

		// 仮のレート減少値（APIから取得するか、roomオブジェクトから取得する）
		const baseRate = user?.rate || 1000; // ユーザーの現在のレート
		const decrease = 10; // 敗北による減少ポイント

		setPreviousRate(baseRate);
		setRateDecrease(decrease);
		setCurrentRate(baseRate);

		// カウントダウンアニメーション
		const startValue = baseRate;
		const endValue = baseRate - decrease;
		const duration = 2000; // 2秒間
		const startTime = Date.now();

		const animateCount = () => {
			const now = Date.now();
			const elapsed = now - startTime;
			const progress = Math.min(elapsed / duration, 1);

			// イージング関数で滑らかに
			const easeOutQuart = 1 - Math.pow(1 - progress, 4);
			const currentValue = Math.floor(startValue - decrease * easeOutQuart);

			setCurrentRate(currentValue);

			if (progress < 1) {
				requestAnimationFrame(animateCount);
			} else {
				setAnimationComplete(true);
			}
		};

		requestAnimationFrame(animateCount);

		// グリッチエフェクトを追加
		const createGlitch = () => {
			if (!glitchRef.current) return;

			const glitch = document.createElement("div");
			glitch.className = "absolute h-[2px] bg-red-500/70 animate-glitch";

			// ランダムな位置と幅
			const top = Math.random() * 100;
			const width = 20 + Math.random() * 80; // 20%〜100%の幅
			glitch.style.top = `${top}%`;
			glitch.style.width = `${width}%`;
			glitch.style.left = `${Math.random() * (100 - width)}%`;

			glitchRef.current.appendChild(glitch);

			// 一定時間後に削除
			setTimeout(
				() => {
					glitch.remove();
				},
				300 + Math.random() * 700,
			); // 300ms〜1000msでランダム
		};

		const glitchInterval = setInterval(createGlitch, 200);

		return () => {
			clearInterval(glitchInterval);
		};
	}, [showRateDecrease, user]);

	useEffect(() => {
		// Trigger animations in sequence
		setTimeout(() => setShowScreen(true), 100);

		// レート減少演出を少し遅らせて表示
		setTimeout(() => {
			setShowRateDecrease(true);
		}, 1200);

		// 画面の揺れエフェクト
		const addShake = () => {
			const card = document.querySelector(".defeat-card");
			if (card) {
				card.classList.add("shake-effect");
				setTimeout(() => {
					card.classList.remove("shake-effect");
				}, 500);
			}
		};

		setTimeout(addShake, 300);
		setTimeout(addShake, 1500);
		(async () => {
			await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/${room.hostUserId}/${room.id}/delete`,
				{
					method: "DELETE",
				},
			);
		})();
	}, [room.hostUserId, room.id]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
			<style jsx global>{`
        @keyframes glitch {
          0% {
            opacity: 1;
            transform: translateX(0);
          }
          20% {
            opacity: 0.8;
            transform: translateX(3px);
          }
          40% {
            opacity: 0.4;
            transform: translateX(-3px);
          }
          60% {
            opacity: 0.6;
            transform: translateX(2px);
          }
          80% {
            opacity: 0.2;
            transform: translateX(-2px);
          }
          100% {
            opacity: 0;
            transform: translateX(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          10% { opacity: 0.8; }
          20% { opacity: 0.4; }
          30% { opacity: 0.6; }
          40% { opacity: 0.2; }
          50% { opacity: 0.8; }
          60% { opacity: 0.4; }
          70% { opacity: 0.6; }
          80% { opacity: 0.2; }
          90% { opacity: 0.8; }
        }
        
        .animate-glitch {
          animation: glitch 0.5s forwards;
        }
        
        .shake-effect {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        .flicker-text {
          animation: flicker 2s infinite;
        }
      `}</style>

			<div className="absolute inset-0 overflow-hidden">
				{/* Cyber grid background */}
				<div className="absolute inset-0 z-0 opacity-20">
					<div className="h-full w-full bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
				</div>

				{/* Glowing orbs in background */}
				<div className="absolute left-1/4 top-1/4 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl"></div>
				<div className="absolute bottom-1/4 right-1/4 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/20 blur-3xl"></div>
			</div>

			<Card
				className={`defeat-card relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-red-500/20 bg-black/80 p-6 shadow-[0_0_15px_rgba(239,68,68,0.3)] backdrop-blur-sm transition-all duration-500 ${
					showScreen ? "scale-100 opacity-100" : "scale-90 opacity-0"
				}`}
			>
				<div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-red-500/20 blur-3xl"></div>
				<div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-red-500/20 blur-3xl"></div>

				{/* Defeat header */}
				<div className="mb-6 text-center">
					<div className="mb-2 flex justify-center">
						<Skull className="h-12 w-12 text-red-500" />
					</div>
					<h1 className="text-center font-mono text-4xl font-bold uppercase tracking-wider text-white">
						<span className="mr-2 inline-block animate-pulse text-red-500">
							[
						</span>
						DEFEAT
						<span className="ml-2 inline-block animate-pulse text-red-500">
							]
						</span>
					</h1>
					<div className="mt-2 text-red-400">敗北</div>
				</div>

				{/* レート減少表示 */}
				<div
					className={`relative mb-8 overflow-hidden rounded-lg border border-red-500/30 bg-black/50 p-4 transition-all duration-700 ${
						showRateDecrease
							? "opacity-100 translate-y-0"
							: "opacity-0 translate-y-10"
					}`}
					ref={glitchRef}
				>
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center gap-2">
							<TrendingDown className="h-5 w-5 text-red-400" />
							<span className="text-red-200">レートポイント</span>
						</div>
					</div>

					{/* レート変化の表示 */}
					<div className="flex items-center justify-center gap-3 my-4">
						<div className="text-xl font-bold text-white">{previousRate}</div>
						<div className="flex flex-col items-center">
							<ArrowRight className="h-6 w-6 text-red-400" />
							{/* 減少分の表示 */}
							<div className="text-red-400 font-bold">-{rateDecrease}</div>
						</div>
						<div className="text-xl font-bold text-red-300">{currentRate}</div>
					</div>

					{/* プログレスバー */}
					<div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-800">
						<div
							className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-1000"
							style={{
								width: showRateDecrease ? "100%" : "0%",
								transition: "width 2s cubic-bezier(0.34, 1.56, 0.64, 1)",
							}}
						></div>
					</div>

					{/* 減少分の説明 */}
					<div className="mt-3 text-center text-sm text-red-200/80">
						敗北ペナルティ: {rateDecrease}ポイント失いました
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<Button
						onClick={() => {
							router.push("/rooms");
						}}
						className="cursor-pointer border border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10"
					>
						<LuSwords className="mr-2 h-4 w-4" />
						対戦へ
					</Button>
					<Button
						onClick={() => {
							router.push("/");
						}}
						className="cursor-pointer border border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10"
					>
						<HomeIcon className="mr-2 h-4 w-4" />
						ホームへ
					</Button>
				</div>

				{/* Cyber decorative elements */}
				{/* <div className="absolute bottom-0 left-0 h-1 w-1/3 bg-gradient-to-r from-red-500 to-transparent"></div>
				<div className="absolute right-0 top-0 h-1 w-1/3 bg-gradient-to-l from-red-500 to-transparent"></div>
				<div className="absolute bottom-6 right-6 h-20 w-1 animate-pulse bg-red-500/50"></div>
				<div className="absolute left-6 top-6 h-1 w-20 animate-pulse bg-red-500/50"></div> */}
			</Card>
		</div>
	);
}

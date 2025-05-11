"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Code2,
	Terminal,
	Cpu,
	Zap,
	ArrowLeft,
	Database,
	Server,
	Star,
	Trophy,
	Sparkles,
	Shield,
	Lightbulb,
	Github,
	Gamepad2,
	Info,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import confetti from "canvas-confetti";
import { useUserContext } from "~/context/UserProvider";
import { characterToImagePath } from "~/lib/utils";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";

// キャラクタータイプの定義
type Character = {
	id: string;
	name: string;
	type: string;
	basePower: number;
	baseLife: number;
	baseSpeed: number;
	baseEvasion: number;
	specialSkillName?: string;
	specialSkillDescription?: string;
	specialSkillTurn?: number;
	passiveSkillName?: string;
	passiveSkillDescription?: string;
	isNew?: boolean;
};

// ガチャ結果の型定義
type GachaResult = {
	id: string;
	name: string;
	message?: string;
	character?: Character;
	isNew?: boolean;
};

type GachaClientProps = {
	initialToken: string;
};

export function GachaClient({ initialToken }: GachaClientProps) {
	const { user } = useUserContext();
	const [activeTab, setActiveTab] = useState("regular");
	const [availablePoints, setAvailablePoints] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	const [showResult, setShowResult] = useState(false);
	const [result, setResult] = useState<GachaResult | null>(null);
	const [githubUrl, setGithubUrl] = useState("");
	const [isGithubLoading, setIsGithubLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loadingProgress, setLoadingProgress] = useState<number>(0);
	const [loadingBarColor, setLoadingBarColor] =
		useState<string>("bg-green-500");
	const [showNewBadge, setShowNewBadge] = useState<boolean>(false);

	const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);

	// ユーザーポイントの取得
	useEffect(() => {
		if (!user) return;

		const fetchUserPoints = async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${user.uid}/point`,
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${initialToken}`,
						},
					},
				);

				if (!res.ok) {
					console.error("Failed to fetch user points:", res.statusText);
					return;
				}

				const data = await res.json();
				setAvailablePoints(data);
			} catch (error) {
				console.error("Error fetching user points:", error);
			}
		};

		fetchUserPoints();
	}, [user, initialToken]);

	// 紙吹雪エフェクトを実行する関数
	const triggerConfetti = () => {
		try {
			if (confettiCanvasRef.current && typeof confetti !== "undefined") {
				const myConfetti = confetti.create(confettiCanvasRef.current, {
					resize: true,
					useWorker: true,
				});

				myConfetti({
					particleCount: 150,
					spread: 100,
					origin: { y: 0.5, x: 0.5 },
					colors: [
						"#00ff9d",
						"#00f0ff",
						"#00c3ff",
						"#00ff66",
						"#7bff00",
						"#ffcc00",
					],
				});
			}
		} catch (error) {
			console.error("Confetti error:", error);
		}
	};

	// 通常ガチャを引く関数
	const pullGacha = async () => {
		if (availablePoints < 10) return;

		setAvailablePoints((prev) => prev - 10);
		setIsAnimating(true);
		setShowResult(false);
		setLoadingProgress(0);

		// ローディングバーのアニメーション
		let progress = 0;
		const loadingInterval = setInterval(() => {
			progress += 2;
			setLoadingProgress(progress);

			if (progress > 85) {
				setLoadingBarColor("bg-yellow-500");
			} else if (progress > 65) {
				setLoadingBarColor("bg-blue-500");
			}

			if (progress >= 100) {
				clearInterval(loadingInterval);
			}
		}, 50);

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/gacha`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${initialToken}`,
					},
					body: JSON.stringify({
						userId: user?.uid,
					}),
				},
			);

			clearInterval(loadingInterval);
			setLoadingProgress(100);

			if (!response.ok) {
				throw new Error("API request failed");
			}

			const data = await response.json();
			setResult(data);
			setShowNewBadge(data.isNew || false);
			setShowResult(true);

			if (data.isNew) {
				triggerConfetti();
			}
		} catch (error) {
			console.error("Gacha API error:", error);
			clearInterval(loadingInterval);
			setError("ガチャの実行中にエラーが発生しました");
		} finally {
			setIsAnimating(false);
		}
	};

	// GitHubガチャを実行する関数
	const getCharacterByGithubUrl = async () => {
		if (!githubUrl.trim()) {
			setError("GitHub URLを入力してください");
			return;
		}

		if (!user) {
			setError("ログインが必要です");
			return;
		}

		setError(null);
		setIsGithubLoading(true);
		setIsAnimating(true);
		setShowResult(false);
		setLoadingProgress(0);

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/githubGacha`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${initialToken}`,
					},
					body: JSON.stringify({
						githubUrl: githubUrl,
					}),
				},
			);

			setLoadingProgress(100);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message ||
						"GitHub URLからキャラクターを取得できませんでした",
				);
			}

			const data = await response.json();
			setResult(data.character);
			setShowNewBadge(data.isNew || false);
			setShowResult(true);

			if (data.isNew) {
				triggerConfetti();
			}
		} catch (error) {
			console.error("GitHub Gacha error:", error);
			setError(error instanceof Error ? error.message : "エラーが発生しました");
		} finally {
			setIsAnimating(false);
			setIsGithubLoading(false);
		}
	};

	// 技術タイプに基づく色を取得
	const getTypeColor = (type: string) => {
		const typeColors: Record<string, string> = {
			バージョン管理: "bg-red-500",
			データベース: "bg-blue-500",
			フレームワーク: "bg-amber-700",
			言語: "bg-green-500",
			クラウド: "bg-yellow-400",
			オペレーティングシステム: "bg-purple-800",
			実行環境: "bg-pink-500",
			ゲームエンジン: "bg-indigo-500",
			コンテナー: "bg-teal-500",
		};

		return typeColors[type] || "bg-gray-500";
	};

	return (
		<div className="py-3 gap-0 w-full h-full max-w-md bg-black/80 backdrop-blur-sm rounded-xl shadow-[0_0_15px_rgba(0,255,128,0.3)] border border-green-500/30 overflow-hidden relative z-10">
			{/* 紙吹雬用のキャンバス */}
			<canvas
				ref={confettiCanvasRef}
				className="fixed inset-0 pointer-events-none z-50"
				style={{ width: "100%", height: "100%" }}
			/>

			{/* ヘッダー */}
			<div className="bg-gradient-to-r from-green-900/80 to-green-700/80 p-4 text-center relative">
				<div className="flex items-center justify-center gap-3">
					<Cpu className="h-6 w-6 text-green-300" />
					<h1 className="text-2xl font-bold text-green-300 tracking-wider">
						技術ガチャ
					</h1>
					<Terminal className="h-6 w-6 text-green-300" />
				</div>
			</div>

			{/* ポイント表示 */}
			<div className="text-2xl font-semibold mb-1 text-green-400 bg-black/50 px-4 py-2 rounded-lg border border-green-500/30 shadow-[0_0_10px_rgba(0,255,128,0.2)]">
				<div className="flex items-center gap-2">
					<Database className="h-5 w-5 text-green-400" />
					技術ポイント:{" "}
					<span className="text-emerald-400">{availablePoints}</span>
				</div>
			</div>

			{/* タブ */}
			<div className="px-4 pt-4">
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full h-full grid-cols-2 bg-black/50 border border-green-500/30">
						<TabsTrigger
							value="regular"
							disabled={isAnimating}
							className="data-[state=active]:bg-green-900/50 data-[state=active]:text-green-300 text-green-500"
						>
							<div className="flex items-center gap-2">
								<Gamepad2 className="h-4 w-4" />
								<span>通常ガチャ</span>
							</div>
						</TabsTrigger>
						<TabsTrigger
							value="github"
							disabled={isAnimating}
							className="data-[state=active]:bg-green-900/50 data-[state=active]:text-green-300 text-green-500"
						>
							<div className="flex items-center gap-2">
								<Github className="h-4 w-4" />
								<span>GitHub ガチャ</span>
							</div>
						</TabsTrigger>
					</TabsList>

					<div className="p-4">
						{/* GitHub URL入力 */}
						{activeTab === "github" && !isAnimating && !showResult && (
							<div className="w-full mb-6">
								<div className="relative">
									<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
										<Github className="h-5 w-5 text-green-500" />
									</div>
									<Input
										type="text"
										value={githubUrl}
										onChange={(e) => setGithubUrl(e.target.value)}
										placeholder="https://github.com/username/repository"
										className="pl-10 bg-black/50 border-green-500/30 text-green-300 placeholder:text-green-500/50"
									/>
								</div>
								{error && (
									<div className="mt-2 text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-500/30">
										{error}
									</div>
								)}
							</div>
						)}

						{/* ローディングプログレス */}
						{isAnimating && (
							<div className="w-full bg-gray-800 rounded-full h-5 overflow-hidden border border-green-500/30">
								<div
									className={`h-full ${loadingBarColor} rounded-full transition-all duration-300`}
									style={{ width: `${loadingProgress}%` }}
								/>
							</div>
						)}

						{/* 結果表示 */}
						{showResult && result && (
							<div className="text-center">
								{showNewBadge && (
									<div className="bg-yellow-500 text-black px-3 py-1 rounded-full font-bold text-sm inline-block mb-2">
										NEW!
									</div>
								)}
								<h3 className="text-2xl font-bold text-green-300 mb-2">
									{result.name}
								</h3>
								{result.character?.type && (
									<span
										className={`inline-block px-2 py-0.5 rounded-full text-xs text-white ${getTypeColor(
											result.character.type,
										)}`}
									>
										{result.character.type}
									</span>
								)}
								{result.id && (
									<div className="mt-4">
										<Image
											alt={result.name}
											height={140}
											width={140}
											src={
												characterToImagePath(result.id) || "/placeholder.svg"
											}
											className="rounded-lg border border-green-500/30 mx-auto"
										/>
									</div>
								)}
							</div>
						)}

						{/* アクションボタン */}
						<div className="mt-6 flex gap-4">
							<Link href="/" className="flex-1">
								<Button
									disabled={isAnimating}
									className="w-full bg-black hover:bg-green-900 text-green-400 border border-green-500/50"
								>
									<ArrowLeft className="mr-2 h-4 w-4" />
									戻る
								</Button>
							</Link>
							<Button
								onClick={
									activeTab === "regular" ? pullGacha : getCharacterByGithubUrl
								}
								disabled={
									isAnimating ||
									(activeTab === "regular"
										? availablePoints < 10
										: !githubUrl.trim())
								}
								className="flex-1 bg-black hover:bg-green-900 text-green-400 border border-green-500/50"
							>
								{activeTab === "regular" ? (
									<>
										<Server className="mr-2 h-4 w-4" />
										ガチャを引く
									</>
								) : (
									<>
										<Github className="mr-2 h-4 w-4" />
										取得する
									</>
								)}
							</Button>
						</div>
					</div>
				</Tabs>
			</div>
		</div>
	);
}

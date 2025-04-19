"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, Trophy, Medal, Users, Info, Zap } from "lucide-react";
import Image from "next/image";
import { useUserContext } from "~/context/UserProvider";
import Loading from "~/components/Loading";
import { motion, AnimatePresence } from "framer-motion";

// 技術力レーティングシステムの型定義
type RankingUser = {
	id: string;
	name: string;
	photoUrl: string;
	techRating: number; // 技術力レーティング
	wins: number;
	losses: number;
	rank: number;
	previousRank?: number; // 前回のランク（変動表示用）
};

// テストデータ
const testUsers: RankingUser[] = [
	{
		id: "user1",
		name: "テックマスター",
		photoUrl: "/character/php.webp",
		techRating: 850, // 技術力レーティング
		wins: 42,
		losses: 15,
		rank: 1,
		previousRank: 1,
	},
	{
		id: "user2",
		name: "コードウィザード",
		photoUrl: "/character/php.webp",
		techRating: 780,
		wins: 38,
		losses: 20,
		rank: 2,
		previousRank: 3,
	},
	{
		id: "user3",
		name: "デバッガー",
		photoUrl: "/character/php.webp",
		techRating: 720,
		wins: 35,
		losses: 18,
		rank: 3,
		previousRank: 2,
	},
	{
		id: "user4",
		name: "フロントエンドニンジャ",
		photoUrl: "/character/php.webp",
		techRating: 690,
		wins: 30,
		losses: 22,
		rank: 4,
		previousRank: 5,
	},
	{
		id: "user5",
		name: "バックエンドサムライ",
		photoUrl: "/character/php.webp",
		techRating: 650,
		wins: 28,
		losses: 25,
		rank: 5,
		previousRank: 4,
	},
	{
		id: "user6",
		name: "データサイエンティスト",
		photoUrl: "/character/php.webp",
		techRating: 620,
		wins: 25,
		losses: 20,
		rank: 6,
		previousRank: 6,
	},
	{
		id: "user7",
		name: "クラウドアーキテクト",
		photoUrl: "/character/php.webp",
		techRating: 590,
		wins: 22,
		losses: 18,
		rank: 7,
		previousRank: 8,
	},
	{
		id: "user8",
		name: "セキュリティエキスパート",
		photoUrl: "/character/php.webp",
		techRating: 560,
		wins: 20,
		losses: 15,
		rank: 8,
		previousRank: 7,
	},
	{
		id: "user9",
		name: "モバイルデベロッパー",
		photoUrl: "/character/php.webp",
		techRating: 530,
		wins: 18,
		losses: 20,
		rank: 9,
		previousRank: 9,
	},
	{
		id: "user10",
		name: "AIエンジニア",
		photoUrl: "/character/php.webp",
		techRating: 500,
		wins: 15,
		losses: 15,
		rank: 10,
		previousRank: 10,
	},
	{
		id: "user11",
		name: "ゲームデベロッパー",
		photoUrl: "/character/php.webp",
		techRating: 480,
		wins: 12,
		losses: 18,
		rank: 11,
		previousRank: 12,
	},
	{
		id: "user12",
		name: "ブロックチェーンエンジニア",
		photoUrl: "/character/php.webp",
		techRating: 450,
		wins: 10,
		losses: 20,
		rank: 12,
		previousRank: 11,
	},
];

// 勝利数でソートしたテストデータ
const testUsersWins = [...testUsers]
	.sort((a, b) => b.wins - a.wins)
	.map((user, index) => ({
		...user,
		rank: index + 1,
		previousRank: Math.floor(Math.random() * 12) + 1, // ランダムな前回ランク（デモ用）
	}));

export default function RankingPage() {
	const [users, setUsers] = useState<RankingUser[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedTab, setSelectedTab] = useState<"tech" | "wins">("tech"); // 技術力タブをデフォルトに
	const { user: authUser } = useUserContext();
	const [currentUserRank, setCurrentUserRank] = useState<RankingUser | null>(
		null,
	);
	const [showRankChange, setShowRankChange] = useState(false);
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const listRef = useRef<HTMLDivElement>(null);

	// 背景パーティクル用の状態
	const [particles, setParticles] = useState<
		Array<{
			x: number;
			y: number;
			size: number;
			speed: number;
			opacity: number;
		}>
	>([]);

	// パーティクルの初期化
	useEffect(() => {
		const newParticles = Array.from({ length: 50 }, () => ({
			x: Math.random() * 100,
			y: Math.random() * 100,
			size: Math.random() * 2 + 1,
			speed: Math.random() * 0.3 + 0.1,
			opacity: Math.random() * 0.5 + 0.1,
		}));
		setParticles(newParticles);
	}, []);

	useEffect(() => {
		// ローディングをシミュレート
		const timer = setTimeout(() => {
			// 現在のユーザーをテストユーザーの一人と仮定（デモ用）
			const currentUserId = authUser?.uid || "user5"; // 認証ユーザーがない場合はuser5をデフォルトに

			// テストデータをセット
			setUsers([...testUsers]);

			// 現在のユーザーをランキングから検索
			const currentUser =
				testUsers.find((user) => user.id === currentUserId) || testUsers[4]; // デフォルトはuser5
			setCurrentUserRank(currentUser);

			setIsLoading(false);
			setIsInitialLoad(false);
		}, 1000); // 1秒のローディング時間をシミュレート

		return () => clearTimeout(timer);
	}, [authUser?.uid]);

	const handleTabChange = (tab: "tech" | "wins") => {
		if (tab === selectedTab) return;

		setIsLoading(true);

		// タブ切り替えアニメーションのため少し遅延
		setTimeout(() => {
			setSelectedTab(tab);

			// 選択したタブに基づいてユーザーを並べ替え
			const newUsers = tab === "tech" ? [...testUsers] : [...testUsersWins];

			setUsers(newUsers);
			setShowRankChange(true);

			// 現在のユーザーのランクを更新
			if (authUser?.uid) {
				const currentUser =
					newUsers.find((user) => user.id === authUser.uid) ||
					newUsers.find((user) => user.id === "user5"); // デフォルトはuser5
				setCurrentUserRank(currentUser || null);
			}

			setIsLoading(false);

			// ランク変動表示を一定時間後に非表示
			setTimeout(() => {
				setShowRankChange(false);
			}, 3000);
		}, 300);
	};

	const getRankIcon = (rank: number) => {
		switch (rank) {
			case 1:
				return (
					<motion.div
						initial={{ scale: 0.8, opacity: 0.5 }}
						animate={{ scale: [1, 1.2, 1], opacity: 1 }}
						transition={{
							duration: 2,
							repeat: Number.POSITIVE_INFINITY,
							repeatType: "reverse",
						}}
					>
						<Trophy className="h-6 w-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
					</motion.div>
				);
			case 2:
				return (
					<motion.div
						initial={{ rotate: 0 }}
						animate={{ rotate: [0, 5, 0, -5, 0] }}
						transition={{
							duration: 5,
							repeat: Number.POSITIVE_INFINITY,
							repeatType: "reverse",
						}}
					>
						<Medal className="h-6 w-6 text-gray-300 drop-shadow-[0_0_5px_rgba(229,231,235,0.5)]" />
					</motion.div>
				);
			case 3:
				return (
					<motion.div
						initial={{ rotate: 0 }}
						animate={{ rotate: [0, -5, 0, 5, 0] }}
						transition={{
							duration: 5,
							repeat: Number.POSITIVE_INFINITY,
							repeatType: "reverse",
						}}
					>
						<Medal className="h-6 w-6 text-amber-600 drop-shadow-[0_0_5px_rgba(217,119,6,0.5)]" />
					</motion.div>
				);
			default:
				return (
					<span className="h-6 w-6 flex items-center justify-center text-green-400 font-mono">
						{rank}
					</span>
				);
		}
	};

	// ランク変動を表示するコンポーネント
	const RankChange = ({
		current,
		previous,
	}: { current: number; previous?: number }) => {
		if (!previous || current === previous || !showRankChange) return null;

		const isUp = current < previous;

		return (
			<motion.div
				initial={{ opacity: 0, y: isUp ? 10 : -10 }}
				animate={{ opacity: 1, y: 0 }}
				className={`absolute right-2 top-1 text-xs font-bold flex items-center ${
					isUp ? "text-green-400" : "text-red-400"
				}`}
			>
				{isUp ? (
					<>
						<span className="mr-1">↑</span>
						{previous - current}
					</>
				) : (
					<>
						<span className="mr-1">↓</span>
						{current - previous}
					</>
				)}
			</motion.div>
		);
	};

	if (isLoading) return <Loading message="ランキングデータを取得中" />;

	return (
		<div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 overflow-hidden">
			{/* Background grid effect */}
			<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2MmgtMnYtMnptLTQgMHYyaC0ydi0yaDJ6bTIgMGgydjJoLTJ2LTJ6bS02IDBoMnYyaC0ydi0yem0yLTRoMnYyaC0ydi0yem0yIDBIMzZ2Mmgtc3YtMnptMCA0aDJ2MmgtMnYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')]" />

			{/* Animated circuit lines */}
			<div className="absolute inset-0 overflow-hidden opacity-20">
				<motion.div
					className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent"
					animate={{
						opacity: [0.3, 1, 0.3],
						backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
					}}
					transition={{
						duration: 8,
						repeat: Number.POSITIVE_INFINITY,
						ease: "linear",
					}}
				/>
				<motion.div
					className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-green-500 to-transparent"
					animate={{
						opacity: [0.3, 1, 0.3],
						backgroundPosition: ["0% 0%", "0% 100%", "0% 0%"],
					}}
					transition={{
						duration: 10,
						repeat: Number.POSITIVE_INFINITY,
						ease: "linear",
					}}
				/>
				<motion.div
					className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent"
					animate={{
						opacity: [0.3, 1, 0.3],
						backgroundPosition: ["100% 0%", "0% 0%", "100% 0%"],
					}}
					transition={{
						duration: 8,
						repeat: Number.POSITIVE_INFINITY,
						ease: "linear",
					}}
				/>
				<motion.div
					className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-green-500 to-transparent"
					animate={{
						opacity: [0.3, 1, 0.3],
						backgroundPosition: ["0% 100%", "0% 0%", "0% 100%"],
					}}
					transition={{
						duration: 10,
						repeat: Number.POSITIVE_INFINITY,
						ease: "linear",
					}}
				/>
			</div>

			{/* Floating particles */}
			<div className="absolute inset-0 overflow-hidden">
				{particles.map((particle, index) => (
					<motion.div
						key={index}
						className="absolute rounded-full bg-green-500"
						initial={{
							x: `${particle.x}%`,
							y: `${particle.y}%`,
							width: `${particle.size}px`,
							height: `${particle.size}px`,
							opacity: particle.opacity,
						}}
						animate={{
							y: [
								`${particle.y}%`,
								`${(particle.y + particle.speed * 100) % 100}%`,
							],
						}}
						transition={{
							duration: 20 / particle.speed,
							repeat: Number.POSITIVE_INFINITY,
							ease: "linear",
						}}
					/>
				))}
			</div>

			<motion.div
				className="w-full max-w-2xl bg-black/80 backdrop-blur-sm rounded-xl shadow-[0_0_15px_rgba(0,255,128,0.3)] border border-green-500/30 overflow-hidden relative z-10"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				{/* Header */}
				<div className="border-b border-green-500/30 bg-black/50 p-4">
					<div className="flex items-center justify-between">
						<motion.div
							whileHover={{ x: -5 }}
							transition={{ type: "spring", stiffness: 400, damping: 10 }}
						>
							<Link
								href="/"
								className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
							>
								<ChevronLeft className="h-5 w-5" />
								<span>ホームに戻る</span>
							</Link>
						</motion.div>
						<motion.div
							className="flex items-center gap-2"
							initial={{ scale: 0.9 }}
							animate={{ scale: 1 }}
							transition={{ duration: 0.3 }}
						>
							<motion.div
								animate={{ rotate: [0, 10, 0, -10, 0] }}
								transition={{
									duration: 5,
									repeat: Number.POSITIVE_INFINITY,
									repeatType: "reverse",
								}}
							>
								<Trophy className="h-6 w-6 text-green-400" />
							</motion.div>
							<h1 className="text-xl font-bold text-green-300 font-mono">
								ランキング
							</h1>
						</motion.div>
					</div>
				</div>

				{/* Tabs */}
				<div className="flex border-b border-green-500/30">
					<motion.button
						onClick={() => handleTabChange("tech")}
						className={`flex-1 py-3 px-4 font-mono text-center transition-colors ${
							selectedTab === "tech"
								? "bg-green-500/20 text-green-300 border-b-2 border-green-400"
								: "text-green-500/70 hover:bg-green-500/10"
						}`}
						whileHover={{ backgroundColor: "rgba(34, 197, 94, 0.15)" }}
						whileTap={{ scale: 0.98 }}
					>
						技術力
					</motion.button>
					<motion.button
						onClick={() => handleTabChange("wins")}
						className={`flex-1 py-3 px-4 font-mono text-center transition-colors ${
							selectedTab === "wins"
								? "bg-green-500/20 text-green-300 border-b-2 border-green-400"
								: "text-green-500/70 hover:bg-green-500/10"
						}`}
						whileHover={{ backgroundColor: "rgba(34, 197, 94, 0.15)" }}
						whileTap={{ scale: 0.98 }}
					>
						勝利数
					</motion.button>
				</div>

				{/* Current user ranking */}
				{currentUserRank && (
					<motion.div
						className="p-4 border-b border-green-500/30 bg-green-500/10"
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
					>
						<div className="text-sm text-green-400 font-mono mb-2 flex items-center gap-2">
							<Zap className="h-4 w-4" />
							あなたのランキング
						</div>
						<div className="flex items-center gap-3">
							<motion.div
								className="flex items-center justify-center w-10 h-10 rounded-full bg-black/50 border border-green-500/50"
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ delay: 0.3 }}
							>
								{getRankIcon(currentUserRank.rank)}
							</motion.div>
							<motion.div
								className="relative"
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ delay: 0.4 }}
							>
								<Image
									src={currentUserRank.photoUrl || "/placeholder.svg"}
									alt={currentUserRank.name}
									width={40}
									height={40}
									className="object-cover rounded-full border-2 border-green-500/50"
								/>
								<motion.div
									className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"
									animate={{
										boxShadow: [
											"0 0 0 0 rgba(34, 197, 94, 0.7)",
											"0 0 0 10px rgba(34, 197, 94, 0)",
											"0 0 0 0 rgba(34, 197, 94, 0)",
										],
									}}
									transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
								/>
							</motion.div>
							<motion.div
								className="flex-1"
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.5 }}
							>
								<div className="text-green-300 font-mono">
									{currentUserRank.name}
								</div>
								<div className="flex items-center gap-4 mt-1">
									<span className="text-xs text-green-400 font-mono">
										{selectedTab === "tech" ? "技術力: " : "勝利: "}
										<motion.span
											className="font-bold"
											key={selectedTab + currentUserRank.id}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ duration: 0.3 }}
										>
											{selectedTab === "tech"
												? currentUserRank.techRating
												: currentUserRank.wins}
										</motion.span>
									</span>
									<span className="text-xs text-green-400/70 font-mono">
										勝敗: {currentUserRank.wins}W - {currentUserRank.losses}L
									</span>
								</div>
							</motion.div>
							<motion.div
								className="text-xl font-bold text-green-300 font-mono relative"
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ delay: 0.6 }}
							>
								#{currentUserRank.rank}
								<RankChange
									current={currentUserRank.rank}
									previous={currentUserRank.previousRank}
								/>
							</motion.div>
						</div>
					</motion.div>
				)}

				{/* Rankings list */}
				<div
					ref={listRef}
					className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-green-500/30 scrollbar-track-black/30"
				>
					<AnimatePresence mode="wait">
						{isLoading ? (
							<motion.div
								key="loading"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="flex justify-center items-center h-40"
							>
								<div className="text-green-500 flex items-center gap-2">
									<motion.div
										animate={{ rotate: 360 }}
										transition={{
											duration: 1,
											repeat: Number.POSITIVE_INFINITY,
											ease: "linear",
										}}
									>
										<Zap className="h-5 w-5" />
									</motion.div>
									データ更新中...
								</div>
							</motion.div>
						) : users.length > 0 ? (
							<motion.div
								key={selectedTab}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="divide-y divide-green-500/30"
							>
								{users.map((user, index) => (
									<motion.div
										key={user.id}
										initial={{
											opacity: 0,
											y: 20,
											backgroundColor:
												user.id === currentUserRank?.id
													? "rgba(34, 197, 94, 0.2)"
													: "transparent",
										}}
										animate={{
											opacity: 1,
											y: 0,
											backgroundColor:
												user.id === currentUserRank?.id
													? "rgba(34, 197, 94, 0.1)"
													: "transparent",
										}}
										transition={{
											delay: isInitialLoad ? index * 0.05 : 0,
											duration: 0.3,
										}}
										whileHover={{
											backgroundColor:
												user.id === currentUserRank?.id
													? "rgba(34, 197, 94, 0.15)"
													: "rgba(34, 197, 94, 0.05)",
										}}
										className={`flex items-center gap-3 p-4 transition-colors relative ${
											user.id === currentUserRank?.id ? "bg-green-500/10" : ""
										}`}
									>
										<motion.div
											className="flex items-center justify-center w-10 h-10 rounded-full bg-black/50 border border-green-500/50"
											whileHover={{ scale: 1.05 }}
										>
											{getRankIcon(user.rank)}
										</motion.div>
										<motion.div
											className="relative"
											whileHover={{ scale: 1.05 }}
											transition={{
												type: "spring",
												stiffness: 400,
												damping: 10,
											}}
										>
											<Image
												src={user.photoUrl || "/placeholder.svg"}
												alt={user.name}
												width={40}
												height={40}
												className="object-cover rounded-full border-2 border-green-500/50"
											/>
											{user.rank <= 3 && (
												<motion.div
													className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
														user.rank === 1
															? "bg-yellow-400"
															: user.rank === 2
																? "bg-gray-300"
																: "bg-amber-600"
													}`}
													animate={{
														boxShadow: [
															"0 0 0 0 rgba(255, 255, 255, 0.7)",
															"0 0 0 10px rgba(255, 255, 255, 0)",
															"0 0 0 0 rgba(255, 255, 255, 0)",
														],
													}}
													transition={{
														duration: 2,
														repeat: Number.POSITIVE_INFINITY,
													}}
												/>
											)}
										</motion.div>
										<div className="flex-1">
											<div className="text-green-300 font-mono">
												{user.name}
											</div>
											<div className="flex items-center gap-4 mt-1">
												<motion.span
													className="text-xs text-green-400 font-mono"
													key={`${user.id}-${selectedTab}`}
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													transition={{ duration: 0.3 }}
												>
													{selectedTab === "tech" ? "技術力: " : "勝利: "}
													<span className="font-bold">
														{selectedTab === "tech"
															? user.techRating
															: user.wins}
													</span>
												</motion.span>
												<span className="text-xs text-green-400/70 font-mono">
													勝敗: {user.wins}W - {user.losses}L
												</span>
											</div>
										</div>
										<motion.div
											className="text-xl font-bold text-green-300 font-mono relative"
											whileHover={{ scale: 1.1 }}
											transition={{
												type: "spring",
												stiffness: 400,
												damping: 10,
											}}
										>
											#{user.rank}
											<RankChange
												current={user.rank}
												previous={user.previousRank}
											/>
										</motion.div>
									</motion.div>
								))}
							</motion.div>
						) : (
							<motion.div
								key="empty"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="p-8 text-center text-green-500/70"
							>
								<motion.div
									animate={{
										y: [0, -10, 0],
										opacity: [0.5, 1, 0.5],
									}}
									transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
									className="flex justify-center"
								>
									<Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
								</motion.div>
								<p>ランキングデータがありません</p>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Info footer */}
				<motion.div
					className="p-4 border-t border-green-500/30 bg-black/50"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.8 }}
				>
					<div className="flex items-start gap-2 text-xs text-green-500/70">
						<motion.div
							animate={{ rotate: [0, 10, 0, -10, 0] }}
							transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY }}
						>
							<Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
						</motion.div>
						<p>
							技術力レーティングシステムは、対戦ゲームの技術的な実力を数値化するために使われる評価システムです。
							勝敗の結果だけでなく、対戦相手の技術力も考慮されます。技術力の高い相手に勝つとより多くのポイントが得られます。
						</p>
					</div>
				</motion.div>
			</motion.div>

			{/* Tech decorations */}
			<motion.div
				className="absolute bottom-4 left-4 text-green-500/30 font-mono text-xs"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1 }}
			>
				<div>TECH:RANKING</div>
			</motion.div>

			<motion.div
				className="absolute top-4 right-4 text-green-500/30 font-mono text-xs"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1 }}
			>
				<div className="flex items-center gap-1">
					<motion.div
						className="w-1 h-1 bg-green-500 rounded-full"
						animate={{
							boxShadow: [
								"0 0 0 0 rgba(34, 197, 94, 0.7)",
								"0 0 0 4px rgba(34, 197, 94, 0)",
								"0 0 0 0 rgba(34, 197, 94, 0)",
							],
						}}
						transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
					/>
				</div>
			</motion.div>

			{/* Add global styles for scrollbar */}
			<style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thumb-green-500\/30::-webkit-scrollbar-thumb {
          background-color: rgba(34, 197, 94, 0.3);
          border-radius: 3px;
        }
        .scrollbar-track-black\/30::-webkit-scrollbar-track {
          background-color: rgba(0, 0, 0, 0.3);
        }
      `}</style>
		</div>
	);
}

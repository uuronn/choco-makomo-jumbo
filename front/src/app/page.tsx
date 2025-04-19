"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
	Terminal,
	Swords,
	ChevronRight,
	Database,
	BookOpen,
	Trophy,
	Zap,
	Shield,
	Edit2,
	X,
	Check,
} from "lucide-react";
import Image from "next/image";
import { SlEnergy } from "react-icons/sl";
import { FaLaptopCode } from "react-icons/fa";
import { Coins } from "lucide-react";
import { useUserContext } from "~/context/UserProvider";
import { useUser } from "~/hook/useUser";
import Loading from "~/components/Loading";

// 技術力に応じた称号を取得する関数
const getTechTitle = (
	techPower: number,
): {
	title: string;
	color: string;
	bgColor: string;
	borderColor: string;
	glowColor: string;
} => {
	if (techPower >= 1000)
		return {
			title: "テックレジェンド",
			color: "text-purple-300",
			bgColor: "bg-purple-900/30",
			borderColor: "border-purple-500/50",
			glowColor: "shadow-[0_0_8px_rgba(168,85,247,0.4)]",
		};
	if (techPower >= 900)
		return {
			title: "テックマスター",
			color: "text-red-300",
			bgColor: "bg-red-900/30",
			borderColor: "border-red-500/50",
			glowColor: "shadow-[0_0_8px_rgba(239,68,68,0.4)]",
		};
	if (techPower >= 800)
		return {
			title: "エキスパートエンジニア",
			color: "text-orange-300",
			bgColor: "bg-orange-900/30",
			borderColor: "border-orange-500/50",
			glowColor: "shadow-[0_0_8px_rgba(249,115,22,0.4)]",
		};
	if (techPower >= 700)
		return {
			title: "シニアデベロッパー",
			color: "text-yellow-300",
			bgColor: "bg-yellow-900/30",
			borderColor: "border-yellow-500/50",
			glowColor: "shadow-[0_0_8px_rgba(234,179,8,0.4)]",
		};
	if (techPower >= 600)
		return {
			title: "ミドルエンジニア",
			color: "text-green-300",
			bgColor: "bg-green-900/30",
			borderColor: "border-green-500/50",
			glowColor: "shadow-[0_0_8px_rgba(34,197,94,0.4)]",
		};
	if (techPower >= 500)
		return {
			title: "ジュニアデベロッパー",
			color: "text-blue-300",
			bgColor: "bg-blue-900/30",
			borderColor: "border-blue-500/50",
			glowColor: "shadow-[0_0_8px_rgba(59,130,246,0.4)]",
		};
	if (techPower >= 400)
		return {
			title: "コードアーティスト",
			color: "text-indigo-300",
			bgColor: "bg-indigo-900/30",
			borderColor: "border-indigo-500/50",
			glowColor: "shadow-[0_0_8px_rgba(99,102,241,0.4)]",
		};
	if (techPower >= 300)
		return {
			title: "テックアプレンティス",
			color: "text-cyan-300",
			bgColor: "bg-cyan-900/30",
			borderColor: "border-cyan-500/50",
			glowColor: "shadow-[0_0_8px_rgba(34,211,238,0.4)]",
		};
	if (techPower >= 200)
		return {
			title: "コードビギナー",
			color: "text-teal-300",
			bgColor: "bg-teal-900/30",
			borderColor: "border-teal-500/50",
			glowColor: "shadow-[0_0_8px_rgba(20,184,166,0.4)]",
		};
	return {
		title: "テックルーキー",
		color: "text-gray-300",
		bgColor: "bg-gray-900/30",
		borderColor: "border-gray-500/50",
		glowColor: "shadow-[0_0_8px_rgba(156,163,175,0.4)]",
	};
};

// ナビゲーションアイテムの配列から「遊び方」と「バグ報告」を削除します
const navItems = [
	{
		id: "battle",
		title: "対戦",
		description: "他のプレイヤーと技術力を競え！",
		icon: <Swords className="h-8 w-8" />,
		color: "from-red-500/80 to-orange-500/80",
		path: "/rooms",
	},
	{
		id: "training",
		title: "育成",
		description: "技術をレベルアップ",
		icon: <SlEnergy className="h-8 w-8" />,
		color: "from-blue-500/80 to-cyan-500/80",
		path: "/characters",
	},
	{
		id: "gacha",
		title: "ガチャ",
		description: "新しい技術を獲得しよう",
		icon: <FaLaptopCode className="h-8 w-8" />,
		color: "from-purple-500/80 to-pink-500/80",
		path: "/gacha",
	},
	{
		id: "points",
		title: "ポイ活",
		description: "クイズに正解してポイントゲット",
		icon: <Coins className="h-8 w-8" />,
		color: "from-yellow-500/80 to-amber-500/80",
		path: "/points-activity",
	},
];

// フッターアイテムの配列を追加します
const footerItems = [
	{
		id: "how-to-play",
		title: "遊び方",
		icon: <BookOpen className="h-5 w-5" />,
		path: "/how-to-play",
	},
	{
		id: "bug-report",
		title: "バグ報告",
		icon: <Terminal className="h-5 w-5" />,
		path: "/bugReportForm",
	},
	{
		id: "ranking",
		title: "ランキング",
		icon: <Trophy className="h-5 w-5" />,
		path: "/ranking",
	},
];

export default function HomeScreen() {
	const [hoveredCard, setHoveredCard] = useState<string | null>(null);
	const { user: authUser } = useUserContext();
	const [onlineUsers, setOnlineUsers] = useState<number>(0);
	const [isEditingName, setIsEditingName] = useState(false);
	const [newName, setNewName] = useState("");
	const [nameError, setNameError] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	// サンプルの技術力値（実際のアプリではAPIから取得）
	const [techPower, setTechPower] = useState<number>(720);

	// 技術力に応じた称号を取得
	const techTitle = getTechTitle(techPower);

	const {
		data: user,
		error,
		isLoading,
		mutate,
	} = useUser(authUser?.uid ?? null);

	useEffect(() => {
		const fetchOnlineUsers = async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/onlineUsers`,
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${authUser?.token}`,
						},
					},
				);

				const data = await res.json();

				setOnlineUsers(data.length);
			} catch (err) {
				console.error("Failed to fetch online users:", err);
			}
		};

		fetchOnlineUsers();

		// 実際のアプリではここで技術力データをAPIから取得
	}, [authUser?.token]);

	// 名前編集モードを開始
	const startEditingName = () => {
		if (user) {
			setNewName(user.name);
			setIsEditingName(true);
			// フォーカスを遅延させて確実に適用
			setTimeout(() => {
				inputRef.current?.focus();
			}, 50);
		}
	};

	// 名前編集をキャンセル
	const cancelEditingName = () => {
		setIsEditingName(false);
		setNameError("");
	};

	// 名前を保存
	const saveNewName = async () => {
		// 入力チェック
		if (!newName.trim()) {
			setNameError("名前を入力してください");
			return;
		}

		if (newName.length > 10) {
			setNameError("名前は10文字以下にしてください");
			return;
		}

		try {
			// 実際のアプリではここでAPIを呼び出して名前を更新
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${authUser?.uid}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authUser?.token}`,
					},
					body: JSON.stringify({ name: newName }),
				},
			);

			if (!response.ok) {
				throw new Error("名前の更新に失敗しました");
			}

			// ローカルのユーザーデータを更新（実際のアプリではmutateを使用）
			if (user) {
				mutate({ ...user, name: newName });
			}

			// 編集モードを終了
			setIsEditingName(false);
			setNameError("");

			// 成功メッセージを表示（オプション）
			// toast.success("名前を更新しました")
		} catch (error) {
			console.error("Failed to update name:", error);
			setNameError("名前の更新に失敗しました");
		}
	};

	// 👇 データの状態を見てレンダリングを制御
	if (!authUser) return <Loading message="認証中" />;
	if (isLoading) return <Loading message="ユーザー情報を取得中" />;

	if (!user || error) return <div>エラー: {error.message}</div>;

	return (
		<div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 overflow-hidden">
			{/* Background grid effect */}
			<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2MmgtMnYtMnptLTQgMHYyaC0ydi0yaDJ6bTIgMGgydjJoLTJ2LTJ6bS02IDBoMnYyaC0ydi0yem0yLTRoMnYyaC0ydi0yem0yIDBIMzZ2Mmgtc3YtMnptMCA0aDJ2MmgtMnYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')]" />

			{/* Animated circuit lines */}
			<div className="absolute inset-0 overflow-hidden opacity-20">
				<div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse" />
				<div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-green-500 to-transparent animate-pulse" />
				<div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse" />
				<div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-green-500 to-transparent animate-pulse" />
			</div>

			<div className="w-full max-w-2xl bg-black/80 backdrop-blur-sm rounded-xl shadow-[0_0_15px_rgba(0,255,128,0.3)] border border-green-500/30 overflow-hidden relative z-10">
				{/* User Profile */}
				<div className="border-b border-green-500/30 bg-black/50 p-4">
					<div className="flex flex-col">
						{/* 上部：ユーザー情報 */}
						<div className="flex items-center gap-4">
							<div className="relative">
								<Image
									src={user.photoUrl || "/placeholder.svg"}
									alt="ユーザーアバター"
									width={50}
									height={50}
									className="object-cover rounded-full border-2 border-green-500/50"
								/>
								<div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center">
									<div className="w-2 h-2 bg-black rounded-full" />
								</div>
							</div>

							<div className="flex-1">
								{/* 名前表示/編集 */}
								<div className="flex items-center">
									<AnimatePresence mode="wait">
										{isEditingName ? (
											<motion.div
												key="edit-name"
												initial={{ opacity: 0, y: -5 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: 5 }}
												className="flex items-center gap-2 w-full"
											>
												<div className="relative flex-1">
													<input
														ref={inputRef}
														type="text"
														value={newName}
														onChange={(e) => {
															setNewName(e.target.value);
															if (e.target.value.length > 10) {
																setNameError("名前は10文字以下にしてください");
															} else {
																setNameError("");
															}
														}}
														maxLength={10}
														className="w-full bg-black/50 border border-green-500/50 rounded px-2 py-1 text-green-300 font-mono focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
														placeholder="ユーザー名（10文字以下）"
													/>
													{nameError && (
														<div className="absolute -bottom-5 left-0 text-xs text-red-400">
															{nameError}
														</div>
													)}
												</div>
												<button
													type="button"
													onClick={saveNewName}
													className="p-1 cursor-pointer rounded-full bg-green-900/50 border border-green-500/50 text-green-400 hover:bg-green-800/50 transition-colors"
												>
													<Check className="h-4 w-4" />
												</button>
												<button
													type="button"
													onClick={cancelEditingName}
													className="p-1 cursor-pointer rounded-full bg-red-900/50 border border-red-500/50 text-red-400 hover:bg-red-800/50 transition-colors"
												>
													<X className="h-4 w-4" />
												</button>
											</motion.div>
										) : (
											<motion.div
												key="display-name"
												initial={{ opacity: 0, y: 5 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -5 }}
												className="flex items-center gap-2"
											>
												<h2 className="text-xl font-bold text-green-300 font-mono">
													{user.name}
												</h2>
												<button
													type="button"
													onClick={startEditingName}
													className="p-1 cursor-pointer rounded-full bg-black/50 border border-green-500/30 text-green-500/70 hover:text-green-400 hover:border-green-500/50 transition-colors"
												>
													<Edit2 className="h-3.5 w-3.5" />
												</button>
											</motion.div>
										)}
									</AnimatePresence>
								</div>

								{/* 技術ポイント表示 */}
								<div className="flex items-center gap-2 mt-1">
									<Database className="h-4 w-4 text-green-400" />
									<span className="text-sm text-green-400 font-mono">
										技術ポイント:{" "}
										<span className="font-bold">{user.point}</span>
									</span>
								</div>
							</div>
						</div>

						{/* 下部：称号と技術力 - 改良版 */}
						<div className="mt-3 flex flex-wrap gap-3">
							{/* 称号表示 - 改良版 */}
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5 }}
								className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border ${techTitle.bgColor} ${techTitle.borderColor} ${techTitle.glowColor} relative overflow-hidden`}
							>
								<Shield className={`h-4 w-4 ${techTitle.color}`} />
								<span
									className={`text-xs font-mono font-bold ${techTitle.color}`}
								>
									{techTitle.title}
								</span>

								{/* キラキラエフェクト */}
								<motion.div
									className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
									animate={{ translateX: ["100%", "-100%"] }}
									transition={{
										duration: 2,
										repeat: Number.POSITIVE_INFINITY,
										repeatType: "loop",
										ease: "linear",
									}}
								/>
							</motion.div>

							{/* 技術力表示 - 改良版 */}
							<motion.div
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.5, delay: 0.2 }}
								className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-md border border-yellow-500/30 shadow-[0_0_8px_rgba(234,179,8,0.2)]"
							>
								<Zap className="h-4 w-4 text-yellow-400" />
								<span className="text-sm text-yellow-400 font-mono">
									技術力: <span className="font-bold">{techPower}</span>
								</span>
							</motion.div>
						</div>
					</div>
				</div>

				<div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
					{navItems.map((item) => (
						<Link
							href={item.path}
							key={item.id}
							onMouseEnter={() => setHoveredCard(item.id)}
							onMouseLeave={() => setHoveredCard(null)}
							className={`
                relative overflow-hidden group rounded-lg border border-green-500/30
                transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,128,0.3)]
                ${
									hoveredCard === item.id
										? "border-green-400/70 scale-105 z-10"
										: "hover:border-green-400/50"
								}
                `}
						>
							<div className={`bg-gradient-to-br ${item.color} p-4 h-full`}>
								<div className="flex flex-col h-full">
									<div className="flex items-center gap-2 mb-2">
										{item.icon}
										<h2 className="text-xl font-bold text-white">
											{item.title}
										</h2>
									</div>
									<p className="text-sm text-white/80 mb-4">
										{item.description}
									</p>

									<div className="mt-auto flex justify-end">
										<div className="bg-black/30 rounded-full p-1">
											<ChevronRight className="h-5 w-5 text-white" />
										</div>
									</div>
								</div>

								{/* Scan line */}
								<motion.div
									className="absolute inset-0 bg-white/5 mix-blend-overlay pointer-events-none"
									animate={{ top: ["100%", "-100%"] }}
									transition={{
										duration: 2,
										repeat: Number.POSITIVE_INFINITY,
										ease: "linear",
									}}
								/>

								{/* Hover glow effect */}
								<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
							</div>
						</Link>
					))}
				</div>

				<div className="p-4 border-t border-green-500/30 bg-black/50">
					<div className="flex justify-between items-center">
						<div className="text-xs text-green-500/70 font-mono flex items-center gap-2">
							<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
							<span>ONLINE: {onlineUsers}</span>
						</div>
						<div className="text-xs text-green-500/70 font-mono">
							v1.0.0-beta
						</div>
					</div>

					{/* フッターナビゲーション */}
					<div className="mt-3 flex justify-center gap-4">
						{footerItems.map((item) => (
							<Link
								key={item.id}
								href={item.path}
								className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors px-2 py-1 rounded-md hover:bg-green-500/10"
							>
								{item.icon}
								<span className="text-sm">{item.title}</span>
							</Link>
						))}
					</div>
				</div>
			</div>

			{/* Tech decorations around the card */}
			<div className="absolute bottom-4 left-4 text-green-500/30 font-mono text-xs">
				<div>SYS:ONLINE</div>
			</div>

			<div className="absolute top-4 right-4 text-green-500/30 font-mono text-xs">
				<div className="flex items-center gap-1">
					<div className="w-1 h-1 bg-green-500 rounded-full" />
				</div>
			</div>

			{/* Add global styles for animations */}
			<style jsx global>{`
        @keyframes scrollUp {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        .animate-scrollUp {
          animation: scrollUp 60s linear infinite;
        }
      `}</style>
		</div>
	);
}

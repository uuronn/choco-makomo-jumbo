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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import confetti from "canvas-confetti";
import { useUserContext } from "~/context/UserProvider";

// Define the character type
type Character = {
	id: string;
	name: string;
	type: string;
	basePower: number;
	baseLife: number;
	baseSpeed: number;
	baseEvasion: number;
	imageUrl?: string;
	specialSkillName?: string;
	specialSkillDescription?: string;
	specialSkillTurn?: number;
	passiveSkillName?: string;
	passiveSkillDescription?: string;
	isNew?: boolean; // 初獲得かどうかのフラグ
};

// Define the gacha result type
type GachaResult = {
	id: string;
	name: string;
	imageUrl?: string;
	message?: string;
	character?: Character;
	isNew?: boolean; // 初獲得かどうかのフラグ
};

export default function TechGacha() {
	const { user, havingCharacters } = useUserContext();
	const [availablePoints, setAvailablePoints] = useState(100);
	const [isAnimating, setIsAnimating] = useState(false);
	const [showResult, setShowResult] = useState(false);
	const [result, setResult] = useState<GachaResult | null>(null);
	const [particles, setParticles] = useState<
		Array<{
			id: number;
			x: number;
			y: number;
			size: number;
			speed: number;
			color: string;
			rotation: number;
		}>
	>([]);
	const [codeLines, setCodeLines] = useState<
		Array<{
			id: number;
			text: string;
			opacity: number;
			y: number;
			delay: number;
		}>
	>([]);
	const [showPulse, setShowPulse] = useState(false);
	const [showShockwave, setShowShockwave] = useState(false);
	const [lightRays, setLightRays] = useState<boolean>(false);
	const [confettiEffect, setConfettiEffect] = useState<boolean>(false);
	const [glowIntensity, setGlowIntensity] = useState<number>(0);
	const [revealStage, setRevealStage] = useState<number>(0);
	const [specialEffects, setSpecialEffects] = useState<string[]>([]);
	const [explosionParticles, setExplosionParticles] = useState<boolean>(false);
	const [screenShake, setScreenShake] = useState<boolean>(false);
	const [showStars, setShowStars] = useState<boolean>(false);
	const [showFlash, setShowFlash] = useState<boolean>(false);
	const [showCrack, setShowCrack] = useState<boolean>(false);
	const [showEnergyField, setShowEnergyField] = useState<boolean>(false);
	const [showRainbow, setShowRainbow] = useState<boolean>(false);
	const [showFireworks, setShowFireworks] = useState<boolean>(false);
	const [showTrophy, setShowTrophy] = useState<boolean>(false);
	const [showCelebration, setShowCelebration] = useState<boolean>(false);
	const [animationPhase, setAnimationPhase] = useState<number>(0);
	const [loadingProgress, setLoadingProgress] = useState<number>(0);
	const [loadingBarColor, setLoadingBarColor] =
		useState<string>("bg-green-500");
	const [showNewBadge, setShowNewBadge] = useState<boolean>(false);

	// Refs for audio elements
	const pullSoundRef = useRef<HTMLAudioElement | null>(null);
	const rareSoundRef = useRef<HTMLAudioElement | null>(null);
	const epicSoundRef = useRef<HTMLAudioElement | null>(null);
	const legendarySoundRef = useRef<HTMLAudioElement | null>(null);
	const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);

	// Initialize audio elements
	useEffect(() => {
		// Audio elements would be initialized here in a real implementation
		// For this demo, we'll just create the refs but not actually play sounds
		pullSoundRef.current = new Audio();
		rareSoundRef.current = new Audio();
		epicSoundRef.current = new Audio();
		legendarySoundRef.current = new Audio();

		return () => {
			// Cleanup
			pullSoundRef.current = null;
			rareSoundRef.current = null;
			epicSoundRef.current = null;
			legendarySoundRef.current = null;
		};
	}, []);

	// Generate code lines for background effect
	useEffect(() => {
		const lines = [
			"function getRandomTech() {",
			"  const techs = ['React', 'Node.js', 'TypeScript'];",
			"  const weights = [0.5, 0.3, 0.2];",
			"  const random = Math.random();",
			"  let sum = 0;",
			"  for (let i = 0; i < weights.length; i++) {",
			"    sum += weights[i];",
			"    if (random <= sum) return techs[i];",
			"  }",
			"  return techs[0];",
			"}",
			"async function pullGacha(userId) {",
			"  const result = await fetch('/api/gacha', {",
			"    method: 'POST',",
			"    body: JSON.stringify({ userId })",
			"  });",
			"  return result.json();",
			"}",
			"// Calculate tech power based on seed",
			"function calculatePower(seed) {",
			"  const value = hashCode(seed) % 100;",
			"  if (value < 20) return 90 + value;",
			"  if (value < 50) return 70 + value / 2;",
			"  return 50 + value / 3;",
			"}",
		];

		const codeLines = lines.map((text, i) => ({
			id: i,
			text,
			opacity: Math.random() * 0.5 + 0.1,
			y: i * 24,
			delay: i * 0.1,
		}));

		setCodeLines(codeLines);
	}, []);

	// Generate particles for animation
	useEffect(() => {
		if (isAnimating) {
			const newParticles = Array.from({ length: 50 }, (_, i) => ({
				id: i,
				x: Math.random() * 100,
				y: Math.random() * 100,
				size: Math.random() * 5 + 1,
				speed: Math.random() * 3 + 1,
				color: [
					"#00ff9d",
					"#00f0ff",
					"#00c3ff",
					"#00ff66",
					"#7bff00",
					"#ffcc00",
				][Math.floor(Math.random() * 6)],
				rotation: Math.random() * 360,
			}));
			setParticles(newParticles);
		} else {
			setParticles([]);
		}
	}, [isAnimating]);

	// Reset all animation states
	const resetAnimations = () => {
		setShowPulse(false);
		setShowShockwave(false);
		setLightRays(false);
		setConfettiEffect(false);
		setGlowIntensity(0);
		setRevealStage(0);
		setSpecialEffects([]);
		setExplosionParticles(false);
		setScreenShake(false);
		setShowStars(false);
		setShowFlash(false);
		setShowCrack(false);
		setShowEnergyField(false);
		setShowRainbow(false);
		setShowFireworks(false);
		setShowTrophy(false);
		setShowCelebration(false);
		setAnimationPhase(0);
		setShowNewBadge(false);
	};

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
					shapes: ["circle", "square"],
					ticks: 200,
					gravity: 0.8,
					scalar: 1.2,
					disableForReducedMotion: true,
				});
			}
		} catch (error) {
			console.error("Confetti error:", error);
			// エラーが発生しても処理を続行
		}
	};

	// Mock gacha pull function with enhanced animations
	const pullGacha = async () => {
		if (availablePoints < 10) return;

		// Reset all animations
		resetAnimations();

		// Reset loading progress
		setLoadingProgress(0);
		setLoadingBarColor("bg-green-500");

		setAvailablePoints((prev) => prev - 10);
		setIsAnimating(true);
		setShowResult(false);

		// If we had actual sound, we would play it here
		// pullSoundRef.current?.play();

		// Phase 1: Initial animation
		setAnimationPhase(1);
		setTimeout(() => setShowPulse(true), 400);
		setTimeout(() => setShowShockwave(true), 800);

		// Phase 2: Build-up animation
		setTimeout(() => {
			setAnimationPhase(2);
			setShowEnergyField(true);
			setTimeout(() => setShowCrack(true), 500);
		}, 1500);

		// Loading bar animation
		let progress = 0;
		const loadingInterval = setInterval(() => {
			progress += 2;
			setLoadingProgress(progress);

			// Change color based on progress to build anticipation
			if (progress > 85) {
				setLoadingBarColor("bg-yellow-500");
			} else if (progress > 65) {
				setLoadingBarColor("bg-blue-500");
			}

			if (progress >= 100) {
				clearInterval(loadingInterval);
			}
		}, 50);

		// Mock API call with timeout to simulate server request
		setTimeout(async () => {
			// Clear interval if it's still running
			clearInterval(loadingInterval);
			setLoadingProgress(100);

			// Special effect when loading reaches 100%
			setLoadingBarColor("bg-purple-500");
			setTimeout(() => {
				// Flash the loading bar
				setLoadingBarColor("bg-white");
				setTimeout(() => {
					setLoadingBarColor("bg-purple-500");
					setTimeout(() => {
						setLoadingBarColor("bg-white");
						setTimeout(() => {
							setLoadingBarColor("bg-purple-500");
						}, 100);
					}, 100);
				}, 100);
			}, 100);

			// 初獲得かどうかのフラグを宣言
			let isNewCharacter = false;

			// 実際のAPIを呼び出す
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/gacha`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							userId: user?.uid, // 実際の実装ではユーザーIDを使用
						}),
					},
				);

				if (!response.ok) {
					throw new Error("API request failed");
				}

				const data = await response.json();
				setResult(data);

				// 初獲得かどうかのフラグを設定
				isNewCharacter = data.isNew || false;
			} catch (error) {
				console.error("Gacha API error:", error);

				// APIエラー時はフォールバックとしてモックデータを使用
				const techTypes = [
					"バージョン管理",
					"データベース",
					"フレームワーク",
					"言語",
					"クラウド",
					"オペレーティングシステム",
					"実行環境",
					"ゲームエンジン",
					"コンテナー",
				];

				const techNames = [
					"React",
					"Vue.js",
					"Angular",
					"Next.js",
					"Node.js",
					"TypeScript",
					"Python",
					"Rust",
					"Go",
					"Docker",
				];

				// ランダムに技術を選択
				const randomType =
					techTypes[Math.floor(Math.random() * techTypes.length)];
				const randomName =
					techNames[Math.floor(Math.random() * techNames.length)];

				// フォールバック用のモックデータ
				const mockCharacter: Character = {
					id: Math.random().toString(36).substring(2, 9),
					name: randomName,
					type: randomType,
					basePower: Math.floor(Math.random() * 50) + 50,
					baseLife: Math.floor(Math.random() * 100) + 100,
					baseSpeed: Math.floor(Math.random() * 40) + 40,
					baseEvasion: Math.floor(Math.random() * 20) + 5,
					imageUrl: `/placeholder.svg?height=140&width=140&text=${encodeURIComponent(
						randomName,
					)}`,
					specialSkillName: `${randomName}の特殊技`,
					specialSkillDescription: "攻撃力が1.5倍になる",
					specialSkillTurn: Math.floor(Math.random() * 3) + 1,
					passiveSkillName: `${randomName}の受動スキル`,
					passiveSkillDescription: "バトル開始時、HPが10%回復する",
					isNew: false,
				};

				const mockResult: GachaResult = {
					id: mockCharacter.id,
					name: mockCharacter.name,
					imageUrl: mockCharacter.imageUrl,
					character: mockCharacter,
					isNew: false,
				};

				setResult(mockResult);
			}

			// Phase 3: Climax animation
			setAnimationPhase(3);
			setShowFlash(true);
			setScreenShake(true);

			setTimeout(() => {
				setShowFlash(false);
				setExplosionParticles(true);

				// 初獲得の場合は特別な演出を追加
				// isNewCharacter 変数は既に定義されているので、この部分は削除

				if (isNewCharacter) {
					setShowNewBadge(true);
					setSpecialEffects(["rays", "confetti", "shake", "ultimate"]);
				} else {
					setSpecialEffects(["rays"]);
				}

				// Phase 4: Result reveal with special effects
				setTimeout(() => {
					setAnimationPhase(4);
					setShowEnergyField(false);
					setShowCrack(false);
					setScreenShake(false);

					if (specialEffects.includes("rays")) setLightRays(true);
					setGlowIntensity(isNewCharacter ? 15 : 5);

					setTimeout(() => {
						if (specialEffects.includes("confetti")) {
							setConfettiEffect(true);
							setShowStars(true);
							triggerConfetti();
						}

						if (isNewCharacter) {
							setShowRainbow(true);
							setShowFireworks(true);
							setShowTrophy(true);
							setTimeout(() => setShowCelebration(true), 500);
						}

						setTimeout(() => {
							setIsAnimating(false);
							setShowResult(true);

							// Reset some effects after a while but keep the celebratory ones
							setTimeout(() => {
								setExplosionParticles(false);
							}, 3000);

							// Keep the celebration effects longer for new characters
							if (!isNewCharacter) {
								setTimeout(() => {
									resetAnimations();
								}, 5000);
							}
						}, 1000);
					}, 800);
				}, 1000);
			}, 500);
		}, 2500);
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
		<div
			className={`min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 overflow-hidden ${
				screenShake ? "animate-screen-shake" : ""
			}`}
		>
			{/* 紙吹雪用のキャンバス */}
			<canvas
				ref={confettiCanvasRef}
				className="fixed inset-0 pointer-events-none z-50"
				style={{ width: "100%", height: "100%" }}
			/>

			{/* Background code effect */}
			<div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
				<div className="h-full w-full flex flex-col text-xs text-green-500 font-mono">
					{codeLines.map((line) => (
						<motion.div
							key={line.id}
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: line.opacity, y: line.y }}
							transition={{ delay: line.delay, duration: 0.5 }}
							className="whitespace-nowrap"
						>
							{line.text}
						</motion.div>
					))}
				</div>
			</div>

			{/* Background grid effect */}
			<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2MmgtMnYtMnptLTQgMHYyaC0ydi0yaDJ6bTIgMGgydjJoLTJ2LTJ6bS02IDBoMnYyaC0ydi0yem0yLTRoMnYyaC0ydi0yem0yIDBIMzZ2Mmgtc3YtMnptMCA0aDJ2MmgtMnYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')]"></div>

			{/* Flash effect */}
			{showFlash && (
				<motion.div
					className="absolute inset-0 bg-white z-50"
					initial={{ opacity: 1 }}
					animate={{ opacity: 0 }}
					transition={{ duration: 0.5 }}
				/>
			)}

			{/* Rainbow background for high rarity */}
			{showRainbow && (
				<motion.div
					className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 opacity-20 z-0"
					animate={{
						opacity: [0.1, 0.2, 0.1],
						backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
					}}
					transition={{
						duration: 10,
						repeat: Number.POSITIVE_INFINITY,
						ease: "linear",
					}}
				/>
			)}

			{/* Points display */}
			<div
				className="text-2xl font-semibold mb-1 text-green-400 bg-black/50 px-4 py-2 rounded-lg border border-green-500/30 shadow-[0_0_10px_rgba(0,255,128,0.2)]"
				style={{ position: "absolute", top: "20px", right: "20px" }}
			>
				<div className="flex items-center gap-2">
					<Database className="h-5 w-5 text-green-400" />
					技術ポイント:{" "}
					<span className="text-emerald-400">{availablePoints}</span>
				</div>
			</div>

			{/* Animated circuit lines */}
			<div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
				<div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse"></div>
				<div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-green-500 to-transparent animate-pulse"></div>
				<div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse"></div>
				<div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-green-500 to-transparent animate-pulse"></div>
			</div>

			{/* Fireworks effect for high rarity */}
			{showFireworks && (
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					{Array.from({ length: 10 }).map((_, i) => (
						<motion.div
							key={`firework-${i}`}
							className="absolute w-2 h-2 rounded-full"
							style={{
								left: `${Math.random() * 100}%`,
								top: `${Math.random() * 100}%`,
								backgroundColor: [
									"#ff0000",
									"#00ff00",
									"#0000ff",
									"#ffff00",
									"#ff00ff",
									"#00ffff",
								][Math.floor(Math.random() * 6)],
							}}
							initial={{ scale: 0, opacity: 0 }}
							animate={{
								scale: [0, 3, 0],
								opacity: [0, 1, 0],
								boxShadow: [
									"0 0 0px rgba(255,255,255,0)",
									"0 0 30px rgba(255,255,255,0.8)",
									"0 0 0px rgba(255,255,255,0)",
								],
							}}
							transition={{
								duration: 2,
								repeat: Number.POSITIVE_INFINITY,
								delay: Math.random() * 2,
								repeatDelay: Math.random() * 3,
							}}
						/>
					))}
				</div>
			)}

			{/* Main gacha container */}
			<div className="py-3 gap-0 w-full h-full max-w-md bg-black/80 backdrop-blur-sm rounded-xl shadow-[0_0_15px_rgba(0,255,128,0.3)] border border-green-500/30 overflow-hidden relative z-10">
				{/* Header */}
				<div className="bg-gradient-to-r from-green-900/80 to-green-700/80 p-4 text-center relative">
					<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-green-300 to-green-400"></div>
					<div className="flex items-center justify-center gap-3">
						<motion.div
							animate={{ rotate: 360 }}
							transition={{
								duration: 20,
								repeat: Number.POSITIVE_INFINITY,
								ease: "linear",
							}}
						>
							<Cpu className="h-6 w-6 text-green-300" />
						</motion.div>

						<h1 className="text-2xl font-bold text-green-300 tracking-wider">
							技術ガチャ
						</h1>

						<motion.div
							animate={{ rotate: -360 }}
							transition={{
								duration: 20,
								repeat: Number.POSITIVE_INFINITY,
								ease: "linear",
							}}
						>
							<Terminal className="h-6 w-6 text-green-300" />
						</motion.div>
					</div>

					{/* Tech decorations */}
					<div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-black/50 rounded-t-full border-t border-l border-r border-green-500/30"></div>
				</div>

				<div className="p-6 flex flex-col items-center relative">
					{/* Digital counter */}
					<div className="absolute top-2 right-2 font-mono text-xs text-green-500 bg-black/50 px-2 py-1 rounded border border-green-500/30">
						<span>SYSTEM READY </span>
						<motion.span
							animate={{ opacity: [1, 0, 1] }}
							transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
						>
							|
						</motion.span>
					</div>

					<div className="relative w-64 h-64 mb-6 flex items-center justify-center">
						{/* Energy field effect during animation - replaced vortex with a more subtle effect */}
						{showEnergyField && (
							<motion.div
								className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500/30 to-cyan-500/30"
								animate={{
									opacity: [0.3, 0.6, 0.3],
									scale: [1, 1.1, 1],
								}}
								transition={{
									opacity: {
										duration: 2,
										repeat: Number.POSITIVE_INFINITY,
										ease: "easeInOut",
									},
									scale: {
										duration: 3,
										repeat: Number.POSITIVE_INFINITY,
										ease: "easeInOut",
									},
								}}
							/>
						)}

						{/* Crack effect */}
						{showCrack && (
							<div className="absolute inset-0 z-10 overflow-hidden">
								{Array.from({ length: 8 }).map((_, i) => (
									<motion.div
										key={`crack-${i}`}
										className="absolute top-1/2 left-1/2 h-full w-[3px] origin-bottom bg-green-400"
										style={{ rotate: `${i * 45}deg` }}
										initial={{ scaleY: 0 }}
										animate={{ scaleY: 1 }}
										transition={{ duration: 0.5, delay: i * 0.05 }}
									/>
								))}
							</div>
						)}

						{/* Particle effects */}
						{isAnimating &&
							particles.map((particle) => (
								<motion.div
									key={particle.id}
									className="absolute rounded-full"
									initial={{
										x: `calc(50% - ${particle.size / 2}px)`,
										y: `calc(50% - ${particle.size / 2}px)`,
										opacity: 1,
										rotate: 0,
									}}
									animate={{
										x: `calc(${particle.x}% - ${particle.size / 2}px)`,
										y: `calc(${particle.y}% - ${particle.size / 2}px)`,
										opacity: 0,
										rotate: particle.rotation,
									}}
									transition={{ duration: particle.speed, ease: "easeOut" }}
									style={{
										width: `${particle.size}px`,
										height: `${particle.size}px`,
										backgroundColor: particle.color,
										boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
									}}
								/>
							))}

						{/* Explosion particles */}
						{explosionParticles && (
							<div className="absolute inset-0 z-20">
								{Array.from({ length: 30 }).map((_, i) => (
									<motion.div
										key={`explosion-${i}`}
										className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
										style={{
											backgroundColor: [
												"#00ff9d",
												"#00f0ff",
												"#00c3ff",
												"#00ff66",
												"#7bff00",
												"#ffcc00",
											][Math.floor(Math.random() * 6)],
										}}
										initial={{ x: 0, y: 0, scale: 0 }}
										animate={{
											x: (Math.random() - 0.5) * 200,
											y: (Math.random() - 0.5) * 200,
											scale: [0, 1, 0],
											opacity: [0, 1, 0],
										}}
										transition={{
											duration: 1 + Math.random(),
											ease: "easeOut",
										}}
									/>
								))}
							</div>
						)}

						{/* Pulse effect */}
						{showPulse && (
							<motion.div
								className="absolute inset-0 rounded-full border-2 border-green-400"
								initial={{ scale: 0.8, opacity: 1 }}
								animate={{ scale: 2, opacity: 0 }}
								transition={{ duration: 1, ease: "easeOut" }}
							/>
						)}

						{/* Shockwave effect */}
						{showShockwave && (
							<motion.div
								className="absolute inset-0 rounded-full bg-green-400"
								initial={{ scale: 0.1, opacity: 0.8 }}
								animate={{ scale: 2, opacity: 0 }}
								transition={{ duration: 0.5, ease: "easeOut" }}
							/>
						)}

						{/* Stars effect for high rarity */}
						{showStars && (
							<div className="absolute inset-0 z-30 pointer-events-none">
								{Array.from({ length: 15 }).map((_, i) => (
									<motion.div
										key={`star-${i}`}
										className="absolute"
										style={{
											left: `${Math.random() * 100}%`,
											top: `${Math.random() * 100}%`,
										}}
										animate={{
											scale: [0.5, 1, 0.5],
											opacity: [0.5, 1, 0.5],
											rotate: [0, 360],
										}}
										transition={{
											duration: 2 + Math.random() * 2,
											repeat: Number.POSITIVE_INFINITY,
											delay: Math.random() * 2,
										}}
									>
										<Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
									</motion.div>
								))}
							</div>
						)}

						{/* Trophy animation for legendary items */}
						{showTrophy && (
							<motion.div
								className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full z-40"
								initial={{ y: -100 }}
								animate={{ y: -20 }}
								transition={{
									type: "spring",
									stiffness: 100,
									damping: 10,
								}}
							>
								<motion.div
									animate={{
										rotate: [-5, 5, -5],
										y: [0, -10, 0],
									}}
									transition={{
										duration: 2,
										repeat: Number.POSITIVE_INFINITY,
									}}
								>
									<Trophy className="h-16 w-16 text-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]" />
								</motion.div>
							</motion.div>
						)}

						<AnimatePresence>
							{!showResult ? (
								<div className="relative">
									{/* Loading progress bar */}
									{isAnimating && loadingProgress < 100 && (
										<div className="absolute -top-20 left-0 w-full z-30">
											<div className="bg-black/70 p-3 rounded-lg border border-green-500/30 shadow-[0_0_10px_rgba(0,255,128,0.2)]">
												<div className="text-sm text-center text-green-400 font-mono mb-1">
													解析中... {loadingProgress}%
												</div>
												<div className="w-full bg-gray-800 rounded-full h-5 overflow-hidden border border-green-500/30">
													<motion.div
														className={`h-full ${loadingBarColor} rounded-full`}
														initial={{ width: "0%" }}
														animate={{ width: `${loadingProgress}%` }}
														transition={{ duration: 0.3 }}
													/>
												</div>
											</div>
										</div>
									)}
									<motion.div
										className="w-48 h-48 rounded-full bg-black flex items-center justify-center relative"
										initial={{ boxShadow: "0 0 0px rgba(0,255,128,0.3)" }}
										animate={{
											boxShadow: isAnimating
												? "0 0 30px rgba(0,255,128,0.6)"
												: "0 0 15px rgba(0,255,128,0.3)",
										}}
										transition={{
											duration: 1,
											repeat: Number.POSITIVE_INFINITY,
											repeatType: "reverse",
										}}
									>
										<div className="absolute inset-0 rounded-full border-4 border-green-500/30"></div>
										<div className="absolute inset-2 rounded-full border border-green-500/20"></div>

										{/* Rotating rings */}
										{isAnimating ? (
											<>
												<motion.div
													className="absolute inset-0 rounded-full border-2 border-green-400/30 border-dashed"
													animate={{ rotate: 360 }}
													transition={{
														duration: 8,
														repeat: Number.POSITIVE_INFINITY,
														ease: "linear",
													}}
												></motion.div>
												<motion.div
													className="absolute inset-4 rounded-full border border-green-400/20 border-dashed"
													animate={{ rotate: -360 }}
													transition={{
														duration: 12,
														repeat: Number.POSITIVE_INFINITY,
														ease: "linear",
													}}
												></motion.div>
												<motion.div
													className="absolute inset-8 rounded-full border border-green-400/10"
													animate={{ rotate: 180 }}
													transition={{
														duration: 16,
														repeat: Number.POSITIVE_INFINITY,
														ease: "linear",
													}}
												></motion.div>
											</>
										) : (
											<motion.div
												className="absolute inset-0 rounded-full border border-green-400/20"
												animate={{ rotate: 360 }}
												transition={{
													duration: 30,
													repeat: Number.POSITIVE_INFINITY,
													ease: "linear",
												}}
											></motion.div>
										)}

										<div className="w-32 h-32 rounded-full bg-black border border-green-500/50 flex items-center justify-center relative overflow-hidden">
											{/* Scan line effect */}
											{isAnimating && (
												<motion.div
													className="absolute w-full h-8 bg-green-500/10"
													initial={{ top: -30 }}
													animate={{ top: ["100%", "-20%"] }}
													transition={{
														duration: 1.5,
														repeat: Number.POSITIVE_INFINITY,
														ease: "linear",
													}}
												></motion.div>
											)}

											{isAnimating ? (
												<motion.div
													animate={{
														rotate: 360,
														scale: [1, 1.1, 1],
													}}
													transition={{
														rotate: {
															duration: 2,
															repeat: Number.POSITIVE_INFINITY,
															ease: "linear",
														},
														scale: {
															duration: 1.5,
															repeat: Number.POSITIVE_INFINITY,
														},
													}}
												>
													<Zap className="h-12 w-12 text-green-400 drop-shadow-[0_0_8px_rgba(0,255,128,0.8)]" />
												</motion.div>
											) : (
												<motion.div
													animate={{
														scale: [1, 1.05, 1],
													}}
													transition={{
														duration: 2,
														repeat: Number.POSITIVE_INFINITY,
														repeatType: "reverse",
													}}
												>
													<Code2 className="h-12 w-12 text-green-500" />
												</motion.div>
											)}
										</div>
									</motion.div>

									{/* Code symbols */}
									<motion.div
										className="absolute -top-4 -right-4 text-green-400 font-mono text-xl"
										animate={
											isAnimating
												? { y: [0, -10, 0], opacity: [1, 0.5, 1] }
												: {}
										}
										transition={{
											duration: 2,
											repeat: Number.POSITIVE_INFINITY,
										}}
									>
										{"</>"}
									</motion.div>
									<motion.div
										className="absolute -bottom-4 -left-4 text-green-400 font-mono text-xl"
										animate={
											isAnimating ? { y: [0, 10, 0], opacity: [1, 0.5, 1] } : {}
										}
										transition={{
											duration: 2,
											repeat: Number.POSITIVE_INFINITY,
											delay: 0.5,
										}}
									>
										{"{}"}
									</motion.div>
									<motion.div
										className="absolute -top-4 -left-4 text-green-400 font-mono text-xl"
										animate={
											isAnimating ? { y: [0, -5, 0], opacity: [1, 0.5, 1] } : {}
										}
										transition={{
											duration: 1.5,
											repeat: Number.POSITIVE_INFINITY,
											delay: 0.2,
										}}
									>
										{"()"}
									</motion.div>
									<motion.div
										className="absolute -bottom-4 -right-4 text-green-400 font-mono text-xl"
										animate={
											isAnimating ? { y: [0, 5, 0], opacity: [1, 0.5, 1] } : {}
										}
										transition={{
											duration: 1.8,
											repeat: Number.POSITIVE_INFINITY,
											delay: 0.7,
										}}
									>
										{"[]"}
									</motion.div>
								</div>
							) : (
								<motion.div
									initial={{ scale: 0, rotate: -10 }}
									animate={{
										scale: 1,
										rotate: 0,
										x: specialEffects.includes("shake")
											? [0, -5, 5, -5, 5, 0]
											: 0,
									}}
									transition={{
										type: "spring",
										stiffness: 260,
										damping: 20,
										x: { repeat: 5, duration: 0.1 },
									}}
									className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 p-6 rounded-xl border-2 border-white/50 shadow-lg relative overflow-hidden"
									style={{
										boxShadow: `0 0 ${
											glowIntensity * 5
										}px rgba(255,255,255,0.7)`,
									}}
								>
									{/* Light rays effect */}
									{lightRays && (
										<div className="absolute inset-0 overflow-hidden">
											{Array.from({ length: 12 }).map((_, i) => (
												<motion.div
													key={`ray-${i}`}
													className="absolute top-1/2 left-1/2 h-[300%] w-[20px] origin-bottom"
													style={{
														background:
															"linear-gradient(to top, transparent, rgba(255,255,255,0.7))",
														rotate: `${i * 30}deg`,
														opacity: 0,
													}}
													animate={{ opacity: [0, 0.7, 0] }}
													transition={{
														duration: 3,
														repeat: Number.POSITIVE_INFINITY,
														delay: i * 0.1,
													}}
												/>
											))}
										</div>
									)}

									{/* Confetti effect */}
									{confettiEffect && (
										<div className="absolute inset-0 overflow-hidden">
											{Array.from({ length: 50 }).map((_, i) => (
												<motion.div
													key={`confetti-${i}`}
													className="absolute rounded-sm w-2 h-2"
													style={{
														backgroundColor: [
															"#FFD700",
															"#FF0000",
															"#00FF00",
															"#0000FF",
															"#FF00FF",
															"#00FFFF",
														][Math.floor(Math.random() * 6)],
														top: "-5%",
														left: `${Math.random() * 100}%`,
													}}
													animate={{
														top: "120%",
														left: `${Math.random() * 100}%`,
														rotate: Math.random() * 360,
														opacity: [1, 1, 0],
													}}
													transition={{
														duration: 2 + Math.random() * 3,
														repeat: Number.POSITIVE_INFINITY,
														delay: Math.random() * 2,
													}}
												/>
											))}
										</div>
									)}

									{/* Ultimate effect for new items */}
									{specialEffects.includes("ultimate") && (
										<>
											<motion.div
												className="absolute inset-0 bg-white"
												initial={{ opacity: 1 }}
												animate={{ opacity: 0 }}
												transition={{ duration: 1.5 }}
											/>
											<motion.div
												className="absolute inset-0 rounded-xl"
												style={{
													background:
														"radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)",
													opacity: 0,
												}}
												animate={{ opacity: [0, 0.8, 0] }}
												transition={{
													duration: 2,
													repeat: Number.POSITIVE_INFINITY,
												}}
											/>
										</>
									)}

									{/* Celebration effect for new items */}
									{showCelebration && (
										<div className="absolute inset-0 z-30 overflow-hidden">
											<motion.div
												className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 opacity-30"
												animate={{
													opacity: [0.1, 0.3, 0.1],
													backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
												}}
												transition={{
													duration: 5,
													repeat: Number.POSITIVE_INFINITY,
													ease: "linear",
												}}
											/>
											<motion.div
												className="absolute top-0 left-0 w-full text-center text-xl font-bold text-yellow-300"
												initial={{ y: -20, opacity: 0 }}
												animate={{ y: 0, opacity: 1 }}
												transition={{ delay: 0.5, duration: 0.5 }}
											>
												新技術獲得！
											</motion.div>
										</div>
									)}

									<div className="text-center relative z-10">
										{/* New badge */}
										{showNewBadge && (
											<motion.div
												className="absolute -top-4 -right-4 bg-yellow-500 text-black px-3 py-1 rounded-full font-bold text-sm transform rotate-12 z-20"
												initial={{ scale: 0 }}
												animate={{ scale: [0, 1.2, 1] }}
												transition={{
													duration: 0.5,
													type: "spring",
													stiffness: 300,
												}}
											>
												NEW!
											</motion.div>
										)}

										<motion.h3
											className="text-2xl font-bold text-white mb-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"
											animate={{
												scale: specialEffects.includes("ultimate")
													? [1, 1.1, 1]
													: 1,
												textShadow: specialEffects.includes("ultimate")
													? "0 0 8px white"
													: "none",
											}}
											transition={{
												duration: 1,
												repeat: Number.POSITIVE_INFINITY,
											}}
										>
											{result?.name}
										</motion.h3>

										{/* Type badge */}
										{result?.character?.type && (
											<div className="mb-2">
												<span
													className={`inline-block px-2 py-0.5 rounded-full text-xs text-white ${getTypeColor(
														result.character.type,
													)}`}
												>
													{result.character.type}
												</span>
											</div>
										)}

										<div className="flex flex-col items-center mt-2">
											{result?.imageUrl && (
												<motion.div
													className="relative mb-3"
													animate={{
														rotate: specialEffects.includes("ultimate")
															? [0, 5, 0, -5, 0]
															: 0,
														scale: [1, 1.05, 1],
													}}
													transition={{
														rotate: {
															duration: 5,
															repeat: Number.POSITIVE_INFINITY,
														},
														scale: {
															duration: 2,
															repeat: Number.POSITIVE_INFINITY,
														},
													}}
												>
													<div
														className={`absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent ${
															specialEffects.includes("ultimate")
																? "animate-pulse-fast"
																: "animate-pulse"
														}`}
													></div>

													<Image
														alt={result?.name || ""}
														height={140}
														width={140}
														src={result?.imageUrl || "/placeholder.svg"}
														className="rounded-lg border border-white/30 relative z-10"
													/>
												</motion.div>
											)}

											{/* Character stats */}
											{result?.character && (
												<div className="bg-black/40 rounded-lg p-3 w-full mt-2 border border-white/20">
													<div className="grid grid-cols-2 gap-2 text-sm">
														<div className="flex items-center gap-1">
															<Shield className="h-3 w-3 text-blue-300" />
															<span className="text-blue-300">HP:</span>
															<span className="text-white font-bold">
																{result.character.baseLife}
															</span>
														</div>
														<div className="flex items-center gap-1">
															<Zap className="h-3 w-3 text-red-300" />
															<span className="text-red-300">パワー:</span>
															<span className="text-white font-bold">
																{result.character.basePower}
															</span>
														</div>
														<div className="flex items-center gap-1">
															<Cpu className="h-3 w-3 text-green-300" />
															<span className="text-green-300">スピード:</span>
															<span className="text-white font-bold">
																{result.character.baseSpeed}
															</span>
														</div>
														<div className="flex items-center gap-1">
															<Sparkles className="h-3 w-3 text-yellow-300" />
															<span className="text-yellow-300">回避率:</span>
															<span className="text-white font-bold">
																{result.character.baseEvasion}%
															</span>
														</div>
													</div>

													{/* Skills section */}
													<div className="mt-3 border-t border-white/20 pt-2">
														{result.character.specialSkillName && (
															<div className="mb-2">
																<div className="flex items-center gap-1 text-sm">
																	<Sparkles className="h-3 w-3 text-yellow-300" />
																	<span className="text-yellow-300 font-bold">
																		固有スキル:
																	</span>
																	<span className="text-white">
																		{result.character.specialSkillName}
																	</span>
																</div>
																<div className="text-xs text-gray-300 ml-4 mt-0.5">
																	{result.character.specialSkillDescription}
																	{result.character.specialSkillTurn && (
																		<span className="text-yellow-200">
																			{" "}
																			(ターン:{" "}
																			{result.character.specialSkillTurn})
																		</span>
																	)}
																</div>
															</div>
														)}

														{result.character.passiveSkillName && (
															<div>
																<div className="flex items-center gap-1 text-sm">
																	<Lightbulb className="h-3 w-3 text-blue-300" />
																	<span className="text-blue-300 font-bold">
																		パッシブスキル:
																	</span>
																	<span className="text-white">
																		{result.character.passiveSkillName}
																	</span>
																</div>
																<div className="text-xs text-gray-300 ml-4 mt-0.5">
																	{result.character.passiveSkillDescription}
																</div>
															</div>
														)}
													</div>
												</div>
											)}
										</div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					<div className="w-full flex items-center gap-3 justify-center">
						<Link href="/" className="w-1/2">
							<Button
								disabled={isAnimating}
								className="w-full relative bg-black hover:bg-green-900 text-green-400 border border-green-500/50 px-8 py-6 text-xl rounded-md shadow-[0_0_10px_rgba(0,255,128,0.3)] transition-all hover:shadow-[0_0_15px_rgba(0,255,128,0.5)] disabled:opacity-70 disabled:hover:shadow-[0_0_10px_rgba(0,255,128,0.3)] overflow-hidden group"
							>
								{/* Button glow effect */}
								<div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

								{/* Button text with scan line */}
								<div className="relative flex items-center justify-center gap-2">
									<ArrowLeft className="h-5 w-5" />
									<span className="tracking-wider font-mono">戻る</span>
									<motion.div
										className="absolute inset-0 bg-green-400/20 mix-blend-overlay"
										animate={{ top: ["100%", "-100%"] }}
										transition={{
											duration: 2,
											repeat: Number.POSITIVE_INFINITY,
											ease: "linear",
										}}
									></motion.div>
								</div>
							</Button>
						</Link>
						<Button
							onClick={pullGacha}
							disabled={isAnimating || availablePoints < 10}
							className="w-1/2 relative bg-black hover:bg-green-900 text-green-400 border border-green-500/50 px-8 py-6 text-xl rounded-md shadow-[0_0_10px_rgba(0,255,128,0.3)] transition-all hover:shadow-[0_0_15px_rgba(0,255,128,0.5)] disabled:opacity-70 disabled:hover:shadow-[0_0_10px_rgba(0,255,128,0.3)] overflow-hidden group"
						>
							{/* Button glow effect */}
							<div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

							{/* Button text with scan line */}
							<div className="relative flex items-center justify-center gap-2">
								<Server className="h-5 w-5" />
								<span className="tracking-wider font-mono">ガチャを引く</span>
								<motion.div
									className="absolute inset-0 bg-green-400/20 mix-blend-overlay"
									animate={{ top: ["100%", "-100%"] }}
									transition={{
										duration: 2,
										repeat: Number.POSITIVE_INFINITY,
										ease: "linear",
									}}
								></motion.div>
							</div>
						</Button>
					</div>

					{/* Cost indicator */}
					<div className="mt-2 text-xs text-green-500/70 font-mono text-center">
						コスト: 10 ポイント / 1回
					</div>

					{/* Animated dots */}
					<div className="mt-4 flex items-center justify-center gap-2">
						{Array.from({ length: 10 }).map((_, i) => (
							<motion.div
								key={i}
								className="w-2 h-2 bg-green-500 rounded-full"
								animate={{ opacity: [0.2, 1, 0.2] }}
								transition={{
									duration: 2,
									repeat: Number.POSITIVE_INFINITY,
									delay: i * 0.1,
								}}
							></motion.div>
						))}
					</div>
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
        
        @keyframes pulse-fast {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.8;
          }
        }
        .animate-pulse-fast {
          animation: pulse-fast 0.8s infinite;
        }
        
        @keyframes screen-shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }
        .animate-screen-shake {
          animation: screen-shake 0.5s linear;
        }
      `}</style>
		</div>
	);
}

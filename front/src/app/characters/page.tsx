"use client";

import type React from "react";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import {
	Plus,
	Zap,
	Minus,
	Shield,
	Cpu,
	Sparkles,
	Lightbulb,
	Layers,
	Database,
	AlertTriangle,
	CheckCircle,
} from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { useUserContext } from "../../context/UserProvider";
import type { Character } from "~/type/character";
import { enqueueSnackbar } from "notistack";
import { characterToImagePath } from "~/lib/utils";
import { useUser } from "~/hook/useUser";
import Loading from "~/components/Loading";
import { useUserCharacterList } from "~/hook/useUserCharacter";

type CharacterType =
	| "バージョン管理"
	| "データベース"
	| "フレームワーク"
	| "言語"
	| "クラウド"
	| "オペレーティングシステム"
	| "実行環境"
	| "ゲームエンジン"
	| "コンテナー"
	| "ライブラリ";

const typeColors: Record<CharacterType, string> = {
	バージョン管理: "bg-red-500",
	データベース: "bg-blue-500",
	フレームワーク: "bg-amber-700",
	言語: "bg-green-500",
	クラウド: "bg-yellow-400",
	オペレーティングシステム: "bg-purple-800",
	実行環境: "bg-pink-500",
	ゲームエンジン: "bg-indigo-500",
	コンテナー: "bg-teal-500",
	ライブラリ: "bg-gray-500",
};

// Increment options for stat allocation
const INCREMENT_OPTIONS = [1, 10, 100] as const;

export default function CharacterDevelopment() {
	const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
		null,
	);
	const [availablePoints, setAvailablePoints] = useState(0);
	const [statPoints, setStatPoints] = useState({
		life: 0,
		power: 0,
		speed: 0,
	});
	const [incrementAmount, setIncrementAmount] =
		useState<(typeof INCREMENT_OPTIONS)[number]>(1);

	const { user: authUser } = useUserContext();
	const { data: user, error, isLoading } = useUser(authUser?.uid ?? null);
	const { data: userCharacterList, isLoading: isCharacterListLoading } =
		useUserCharacterList(user?.id ?? null);

	// Add a new state for tracking error state
	const [isErrorState, setIsErrorState] = useState(false);
	// Add state for animation
	const [isAnimating, setIsAnimating] = useState(false);
	// Add ref for canvas
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	// Add animation frame ref
	const animationFrameRef = useRef<number | null>(null);

	const fetchUserPoints = useCallback(
		async (userId: string) => {
			const token = await authUser?.getIdToken();
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/point`,
					{
						headers: { Authorization: `Bearer ${token}` },
					},
				);
				if (!response.ok) throw new Error("Failed to fetch points");
				const pointData = await response.json();
				setAvailablePoints(pointData);
			} catch (error) {
				console.error("Error fetching points:", error);
				enqueueSnackbar("ポイント情報の取得に失敗しました", {
					variant: "error",
				});
			}
		},
		[authUser],
	);

	// Fetch available points when user data is loaded
	useEffect(() => {
		if (user?.id) {
			fetchUserPoints(user.id);
		}
	}, [user, fetchUserPoints]);

	// Add glitch animation styles
	useEffect(() => {
		const style = document.createElement("style");
		style.textContent = `
      @keyframes glitch {
        0% { transform: translate(0) }
        20% { transform: translate(-2px, 2px) }
        40% { transform: translate(-2px, -2px) }
        60% { transform: translate(2px, 2px) }
        80% { transform: translate(2px, -2px) }
        100% { transform: translate(0) }
      }
      
      @keyframes flicker {
        0% { opacity: 1; }
        25% { opacity: 0.5; }
        50% { opacity: 0.8; }
        75% { opacity: 0.2; }
        100% { opacity: 1; }
      }
      
      @keyframes shake {
        0% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        50% { transform: translateX(5px); }
        75% { transform: translateX(-2px); }
        100% { transform: translateX(0); }
      }
      
      .character-image-container {
        position: relative;
        overflow: hidden;
      }
      
      .character-image-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .character-image-container.error::before {
        opacity: 1;
        background: linear-gradient(
          rgba(255, 0, 0, 0.1),
          transparent 10%,
          rgba(255, 0, 0, 0.1) 20%,
          transparent 30%
        );
        background-size: 100% 300%;
        animation: scanline 4s linear infinite;
      }
      
      @keyframes scanline {
        0% { background-position: 0 0; }
        100% { background-position: 0 300%; }
      }
      
      .glitching {
        animation: glitch 0.3s forwards;
      }
      
      .error-overlay {
        position: absolute;
        inset: 0;
        background-color: rgba(239, 68, 68, 0.2);
        mix-blend-mode: overlay;
        z-index: 2;
        pointer-events: none;
        animation: flicker 2s infinite;
      }
      
      .error-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(12deg);
        z-index: 3;
        background-color: rgba(239, 68, 68, 0.8);
        backdrop-filter: blur(4px);
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.3);
        animation: shake 3s ease-in-out infinite;
      }
    `;
		document.head.appendChild(style);

		return () => {
			document.head.removeChild(style);
		};
	}, []);

	// Setup canvas for noise effect
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !isErrorState) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Set canvas size
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;

		// Draw noise
		const drawNoise = () => {
			const imageData = ctx.createImageData(canvas.width, canvas.height);
			const data = imageData.data;

			for (let i = 0; i < data.length; i += 4) {
				// Only draw some pixels for performance
				if (Math.random() > 0.97) {
					const noise = Math.random() * 255 * 0.2;
					data[i] = 255; // R
					data[i + 1] = 0; // G
					data[i + 2] = 0; // B
					data[i + 3] = noise; // A
				}
			}

			ctx.putImageData(imageData, 0, 0);
			animationFrameRef.current = requestAnimationFrame(drawNoise);
		};

		drawNoise();

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [isErrorState]);

	// Handle loading and error states
	if (!authUser) return <Loading message="認証中" />;
	if (isLoading) return <Loading message="ユーザー情報を取得中" />;
	if (!user || error)
		return (
			<div className="p-4 text-red-400">
				エラー: {error?.message || "ユーザー情報の取得に失敗しました"}
			</div>
		);

	const handleCharacterSelect = (character: Character) => {
		setSelectedCharacter(character);
		// Reset stat points when selecting a new character
		setStatPoints({ life: 0, power: 0, speed: 0 });
	};

	const handleDevelop = async () => {
		if (!selectedCharacter || !user) return;

		const totalPointsUsed =
			statPoints.life + statPoints.power + statPoints.speed;
		if (totalPointsUsed <= 0) {
			enqueueSnackbar("ポイントを割り当ててください", { variant: "warning" });
			return;
		}

		const token = await authUser.getIdToken();
		// console.info("token", token);

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${user.id}/characters/${selectedCharacter.characterId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						life: statPoints.life,
						power: statPoints.power,
						speed: statPoints.speed,
					}),
				},
			);

			if (!response.ok) throw new Error("キャラクター育成に失敗しました");

			// const data = (await response.json()) as LevelUpResult;

			// Update character with new stats
			// setSelectedCharacter((prev) => {
			// 	if (!prev) return prev;
			// 	return {
			// 		...prev,
			// 		level: data.level,
			// 		life: data.life,
			// 		power: data.power,
			// 		speed: data.speed,
			// 	};
			// });

			// Update available points
			setAvailablePoints((prev) => prev - totalPointsUsed);

			// Reset allocated points
			setStatPoints({ life: 0, power: 0, speed: 0 });

			enqueueSnackbar("レベルアップ！", { variant: "success" });
		} catch (error) {
			console.error("Error developing character:", error);
			enqueueSnackbar("キャラクター育成に失敗しました", { variant: "error" });
		}
	};

	const handleStatChange = (
		stat: keyof typeof statPoints,
		increment: boolean,
	) => {
		setStatPoints((prev) => {
			const currentValue = prev[stat];
			const usedPoints = prev.life + prev.power + prev.speed;
			const remainingPoints = availablePoints - usedPoints;

			if (increment) {
				// Calculate how many points we can add (limited by remaining points)
				const pointsToAdd = Math.min(incrementAmount, remainingPoints);
				return pointsToAdd > 0
					? { ...prev, [stat]: currentValue + pointsToAdd }
					: prev;
			} else {
				// Decrease but not below zero
				return { ...prev, [stat]: Math.max(0, currentValue - incrementAmount) };
			}
		});
	};

	// Add a toggle function with animation
	const toggleErrorState = () => {
		// Start animation
		setIsAnimating(true);

		// Add glitch effect to the whole page
		document.body.classList.add("glitching");

		// After a short delay, toggle the error state
		setTimeout(() => {
			setIsErrorState((prev) => !prev);
			document.body.classList.remove("glitching");

			// End animation after transition
			setTimeout(() => {
				setIsAnimating(false);
			}, 500);
		}, 300);
	};

	const usedPoints = statPoints.life + statPoints.power + statPoints.speed;
	const remainingPoints = availablePoints - usedPoints;

	return (
		<div
			className="bg-gray-900 min-h-screen"
			style={{
				backgroundImage: `
          radial-gradient(rgba(16, 185, 129, 0.15) 1px, transparent 1px),
          linear-gradient(to right, rgba(16, 185, 129, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(16, 185, 129, 0.05) 1px, transparent 1px)
        `,
				backgroundSize: "20px 20px, 20px 20px, 20px 20px, 20px 20px",
			}}
		>
			<div className="container mx-auto p-4 flex flex-col h-screen max-h-screen">
				<h1 className="text-2xl font-bold mb-4 text-green-400 flex items-center">
					<Zap className="mr-2 h-6 w-6 text-emerald-400" />
					技術育成
					<div className="h-px flex-grow ml-4 bg-gradient-to-r from-emerald-400 to-transparent" />
				</h1>

				{/* Character Status Section */}
				<div className="flex-1 mb-4">
					<Card className="w-full border border-emerald-500/50 bg-gray-900/90">
						<CardContent className="p-4 h-full flex flex-col">
							{selectedCharacter ? (
								<div className="flex flex-col max-h-[340px]">
									{/* Character Info and Skills - Horizontal Layout */}
									<div className="flex flex-col md:flex-row gap-4 mb-4">
										{/* Character Image and Basic Info */}
										<div className="flex flex-col items-center">
											<div
												className={`relative w-32 h-32 md:w-80 md:h-80 mb-2 border-2 rounded-lg overflow-hidden shadow-lg character-image-container ${
													isErrorState ? "error" : ""
												}`}
												style={{
													boxShadow: isErrorState
														? "0 0 15px rgba(239, 68, 68, 0.7)"
														: "0 0 10px rgba(16, 185, 129, 0.5)",
													borderColor: isErrorState ? "#ef4444" : "#10b981",
													transition:
														"box-shadow 0.5s ease, border-color 0.5s ease",
												}}
											>
												{/* Normal image with transition */}
												<div
													className="absolute inset-0 transition-opacity duration-500 ease-in-out"
													style={{
														opacity: isErrorState ? 0 : 1,
														transform: isAnimating ? "scale(1.05)" : "scale(1)",
														transition:
															"opacity 0.5s ease, transform 0.5s ease",
													}}
												>
													<Image
														src={
															characterToImagePath(
																selectedCharacter.characterId,
															) || "/placeholder.svg"
														}
														alt={selectedCharacter.name}
														fill
														className="object-cover"
														priority
													/>
												</div>

												{/* Error image with transition */}
												<div
													className="absolute inset-0 transition-opacity duration-500 ease-in-out"
													style={{
														opacity: isErrorState ? 1 : 0,
														transform: isAnimating ? "scale(1.05)" : "scale(1)",
														transition:
															"opacity 0.5s ease, transform 0.5s ease",
														// filter: "hue-rotate(-45deg) contrast(1.2)",
													}}
												>
													<Image
														src={
															characterToImagePath(
																`${
																	selectedCharacter.characterId ||
																	"/placeholder.svg"
																}-error`,
															) || "/error-placeholder.svg"
														}
														alt={`${selectedCharacter.name} (エラー)`}
														fill
														className="object-cover"
														priority
													/>
												</div>

												{/* Error overlay */}
												{isErrorState && <div className="error-overlay"></div>}

												{/* Error icon */}
												{/* {isErrorState && (
													<div className="error-icon">
														<AlertTriangle className="h-8 w-8 text-white" />
													</div>
												)} */}

												{/* Canvas for noise effect */}
												{isErrorState && (
													<canvas
														ref={canvasRef}
														className="absolute inset-0 z-10 opacity-30 pointer-events-none"
													/>
												)}

												{/* Toggle button */}
												<div
													className="absolute bottom-2 right-2 flex items-center gap-1 bg-gray-800/80 backdrop-blur-sm border rounded-md px-2 py-1 shadow-lg z-20"
													style={{
														borderColor: isErrorState
															? "rgba(239, 68, 68, 0.5)"
															: "rgba(16, 185, 129, 0.5)",
														boxShadow: isErrorState
															? "0 0 8px rgba(239, 68, 68, 0.5)"
															: "0 0 8px rgba(16, 185, 129, 0.5)",
														transition:
															"border-color 0.3s ease, box-shadow 0.3s ease",
													}}
												>
													<Button
														className={`flex items-center gap-1 text-xs ${
															isErrorState
																? "bg-red-500/80 hover:bg-red-600 text-white"
																: "bg-emerald-500/80 hover:bg-emerald-600 text-white"
														}`}
														onClick={toggleErrorState}
														size="sm"
														disabled={isAnimating}
													>
														<span
															className="transition-transform duration-500"
															style={{
																transform: isAnimating
																	? "rotate(180deg)"
																	: "rotate(0deg)",
															}}
														>
															{isErrorState ? (
																<AlertTriangle className="h-3 w-3" />
															) : (
																<CheckCircle className="h-3 w-3" />
															)}
														</span>
														<span>
															{isErrorState ? "エラー状態" : "通常状態"}
														</span>
													</Button>
												</div>
											</div>
											<h2 className="text-lg font-bold text-green-400">
												{selectedCharacter.name}{" "}
												<span className="text-sm">
													【Lv.{selectedCharacter.level}】
												</span>
											</h2>
										</div>

										{/* Skills Section */}
										<div className="flex-1 bg-gray-800/80 p-3 rounded-md border border-emerald-500/30 h-full overflow-y-auto">
											{/* タイプをスキルの上に移動 */}
											<div className="mb-3 min-h-16">
												<div className="flex items-center gap-1 text-sm">
													<Layers className="h-4 w-4 text-emerald-400 flex-shrink-0" />
													<span className="text-emerald-400 font-bold">
														タイプ:
													</span>
													<span className="text-white">
														<Badge
															className={`${
																typeColors[
																	selectedCharacter.type as CharacterType
																] || "bg-gray-500"
															} text-white ml-1`}
														>
															{selectedCharacter.type}
														</Badge>
													</span>
												</div>
											</div>

											{/* Passive Skill */}
											<div className="mb-3 min-h-16">
												<div className="flex items-center gap-1 text-sm">
													<Lightbulb className="h-4 w-4 text-blue-300 flex-shrink-0" />
													<span className="text-blue-300 font-bold">
														パッシブスキル:
													</span>
													<span className="text-white">
														{selectedCharacter.passiveSkillName
															? selectedCharacter.passiveSkillName
															: "なし"}
													</span>
												</div>
												{selectedCharacter.passiveSkillDescription && (
													<div className="text-xs text-gray-300 ml-5 mt-1">
														{selectedCharacter.passiveSkillDescription}
													</div>
												)}
											</div>

											{/* Special Skill */}
											<div className="min-h-16">
												<div className="flex items-center gap-1 text-sm">
													<Sparkles className="h-4 w-4 text-yellow-300 flex-shrink-0" />
													<span className="text-yellow-300 font-bold">
														スペシャルスキル:
													</span>
													<span className="text-white">
														{selectedCharacter.specialSkillName
															? selectedCharacter.specialSkillName
															: "なし"}
													</span>
												</div>
												{selectedCharacter.specialSkillDescription && (
													<div className="text-xs text-gray-300 ml-5 mt-1">
														{selectedCharacter.specialSkillDescription}
														{selectedCharacter.specialSkillTurn && (
															<span className="text-yellow-200 block mt-1">
																ターン: {selectedCharacter.specialSkillTurn}
															</span>
														)}
													</div>
												)}
											</div>
										</div>

										<div className="flex-1 max-h-[346px] bg-gray-800/50 rounded-md border border-emerald-500/30 p-3">
											<div className="flex items-center justify-between mb-3 flex-wrap gap-2">
												<div className="flex items-center">
													<Database className="h-4 w-4 mr-1 text-emerald-400" />
													<span className="text-green-400 font-semibold">
														技術ポイント:
													</span>
													<span className="text-emerald-400 text-xl ml-1">
														{remainingPoints}
													</span>
												</div>
												<div className="flex items-center gap-2">
													<span className="text-sm text-green-200">
														増減量:
													</span>
													<div className="flex gap-1">
														{INCREMENT_OPTIONS.map((amount) => (
															<Button
																key={amount}
																size="sm"
																variant="outline"
																className={`px-2 py-1 h-7 ${
																	incrementAmount === amount
																		? "bg-emerald-500 text-gray-900 border-emerald-500"
																		: "bg-gray-800 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
																}`}
																onClick={() => setIncrementAmount(amount)}
															>
																{amount}
															</Button>
														))}
													</div>
												</div>
											</div>

											<div className="space-y-2">
												{/* HP Stat */}
												<StatRow
													label="HP"
													icon={
														<Shield className="h-4 w-4 text-blue-300 mr-1" />
													}
													baseValue={selectedCharacter.life}
													addedPoints={statPoints.life}
													onDecrement={() => handleStatChange("life", false)}
													onIncrement={() => handleStatChange("life", true)}
													canDecrement={statPoints.life > 0}
													canIncrement={remainingPoints > 0}
												/>

												{/* Power Stat */}
												<StatRow
													label="パワー"
													icon={<Zap className="h-4 w-4 text-red-300 mr-1" />}
													baseValue={selectedCharacter.power}
													addedPoints={statPoints.power}
													onDecrement={() => handleStatChange("power", false)}
													onIncrement={() => handleStatChange("power", true)}
													canDecrement={statPoints.power > 0}
													canIncrement={remainingPoints > 0}
												/>

												{/* Speed Stat */}
												<StatRow
													label="スピード"
													icon={<Cpu className="h-4 w-4 text-green-300 mr-1" />}
													baseValue={selectedCharacter.speed}
													addedPoints={statPoints.speed}
													onDecrement={() => handleStatChange("speed", false)}
													onIncrement={() => handleStatChange("speed", true)}
													canDecrement={statPoints.speed > 0}
													canIncrement={remainingPoints > 0}
												/>

												{/* Evasion Stat (non-modifiable) */}
												<div className="flex items-center justify-between bg-gray-800/80 p-2 rounded-md border border-emerald-500/30">
													<div className="w-24 text-green-200 flex items-center whitespace-nowrap">
														<Sparkles className="h-4 w-4 text-yellow-300 mr-1" />
														回避率:
													</div>
													<div className="flex-1 mx-2">
														<div className="text-md text-green-400">
															{selectedCharacter.baseEvasion}%
														</div>
													</div>
													<div className="flex items-center gap-1" />
												</div>
											</div>

											<Button
												className="mt-4 w-full bg-emerald-500 text-gray-900 hover:bg-green-400 font-bold"
												style={{ boxShadow: "0 0 8px rgba(16, 185, 129, 0.5)" }}
												onClick={handleDevelop}
												disabled={usedPoints === 0}
											>
												育成する
											</Button>
										</div>
									</div>
								</div>
							) : (
								/* Placeholder content */
								<div className="flex items-center justify-center h-full min-h-[340px]">
									<div className="text-center w-full max-w-md">
										<div className="mb-4 text-emerald-400 opacity-50">
											<Zap className="h-16 w-16 mx-auto" />
										</div>
										<p className="text-green-200 text-lg">
											キャラクターを選択してください
										</p>
										<p className="text-green-400/50 text-sm mt-2">
											下のリストから育成したい技術を選んでください
										</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Character List Section */}
				<div className="overflow-auto border h-full rounded-lg p-4 border-emerald-500/30 bg-gray-900/80">
					<h2 className="text-xl font-bold mb-4 text-green-400 flex items-center">
						所持技術
						<div className="h-px flex-grow ml-4 bg-gradient-to-r from-emerald-400 to-transparent" />
					</h2>

					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
						{isCharacterListLoading ? (
							<div className="col-span-full text-center py-8 text-green-400/50">
								キャラクター取得中...
							</div>
						) : userCharacterList && userCharacterList.length > 0 ? (
							userCharacterList.map((character) => (
								<CharacterCard
									key={character.characterId}
									character={character}
									isSelected={
										selectedCharacter?.characterId === character.characterId
									}
									onSelect={() => handleCharacterSelect(character)}
								/>
							))
						) : (
							<div className="col-span-full text-center py-8 text-green-400/50">
								技術がありません。ガチャを引いて技術を獲得しましょう。
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

// Extracted component for stat rows
interface StatRowProps {
	label: string;
	icon: React.ReactNode;
	baseValue: number;
	addedPoints: number;
	onIncrement: () => void;
	onDecrement: () => void;
	canIncrement: boolean;
	canDecrement: boolean;
}

function StatRow({
	label,
	icon,
	baseValue,
	addedPoints,
	onIncrement,
	onDecrement,
	canIncrement,
	canDecrement,
}: StatRowProps) {
	return (
		<div className="flex items-center justify-between bg-gray-800/80 p-2 rounded-md border border-emerald-500/30">
			<div className="w-24 text-green-200 flex items-center whitespace-nowrap">
				{icon}
				{label}:
			</div>
			<div className="flex-1 mx-2">
				<div className="text-md text-green-400">
					{baseValue}
					{addedPoints > 0 && (
						<span className="text-emerald-400">{` (+${addedPoints})`}</span>
					)}
				</div>
			</div>
			<div className="flex items-center gap-1">
				<Button
					className="bg-gray-800 hover:bg-emerald-500 hover:text-gray-900 border border-emerald-500 text-emerald-400"
					size="icon"
					onClick={onDecrement}
					disabled={!canDecrement}
				>
					<Minus className="h-4 w-4" />
				</Button>
				<Button
					className="bg-gray-800 hover:bg-emerald-500 hover:text-gray-900 border border-emerald-500 text-emerald-400"
					size="icon"
					onClick={onIncrement}
					disabled={!canIncrement}
				>
					<Plus className="h-4 w-4" />
				</Button>
				<div className="w-12 text-center text-emerald-400">{addedPoints}</div>
			</div>
		</div>
	);
}

// Modify the CharacterCard component to include error state handling
interface CharacterCardProps {
	character: Character;
	isSelected: boolean;
	onSelect: () => void;
}

function CharacterCard({
	character,
	isSelected,
	onSelect,
}: CharacterCardProps) {
	return (
		<div
			className={`cursor-pointer p-2 rounded-lg transition-all ${
				isSelected
					? "bg-emerald-500/20 border border-emerald-500"
					: "hover:bg-gray-800 border border-emerald-500/10 hover:border-emerald-500/50"
			}`}
			style={
				isSelected ? { boxShadow: "0 0 10px rgba(16, 185, 129, 0.3)" } : {}
			}
			onClick={onSelect}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					onSelect();
				}
			}}
			tabIndex={0}
			role="button"
			aria-pressed={isSelected}
		>
			<div className="flex flex-col items-center">
				<div className="relative w-16 h-16 mb-2 overflow-hidden rounded-lg">
					<Image
						src={
							characterToImagePath(character.characterId) || "/placeholder.svg"
						}
						alt={character.name}
						fill
						className="object-cover"
					/>
				</div>
				<div className="text-center font-medium text-green-200 truncate w-full">
					{character.name}
				</div>
				<div className="text-center text-xs text-emerald-400">
					Lv.{character.level}
				</div>
			</div>
		</div>
	);
}

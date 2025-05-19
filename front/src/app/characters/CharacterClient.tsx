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
	HandshakeIcon,
	ActivityIcon,
	CpuIcon,
	ZapIcon,
	HeartIcon,
	BicepsFlexedIcon,
	CrosshairIcon,
	FootprintsIcon,
	GhostIcon,
} from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { useUserContext } from "~/context/UserProvider";
import type { Character } from "~/type/character";
import { enqueueSnackbar } from "notistack";
import { characterToImagePath } from "~/lib/utils";
import { useUser } from "~/hook/useUser";
import Loading from "~/components/Loading";
import { useUserCharacterList } from "~/hook/useUserCharacter";
import { SectionContainer } from "~/components/SectionContainer";
import { MainContainer } from "~/components/MainContainer";
import { TechPoint } from "~/components/techPoint";
import { CharacterStatusEditer } from "~/components/CharacterStatusEditer";
import { CharacterStatus } from "~/components/CharacterStatus";

type CharacterClientProps = {
	initialToken: string;
};

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

const INCREMENT_OPTIONS = [1, 10, 100] as const;

// CharacterCardコンポーネントの型定義
interface CharacterCardProps {
	character: Character;
	isSelected: boolean;
	onSelect: () => void;
}

// CharacterCardコンポーネント
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

export function CharacterClient({ initialToken }: CharacterClientProps) {
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
	const [isErrorState, setIsErrorState] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const animationFrameRef = useRef<number | null>(null);

	const { user: authUser } = useUserContext();
	const {
		data: user,
		error: userError,
		isLoading: isUserLoading,
	} = useUser(authUser?.uid ?? null);

	const {
		data: userCharacterList,
		error: UserCharacterError,
		isLoading: isCharacterListLoading,
	} = useUserCharacterList(user?.id ?? null, initialToken);

	const fetchUserPoints = useCallback(
		async (userId: string) => {
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/point`,
					{
						headers: { Authorization: `Bearer ${initialToken}` },
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
		[initialToken],
	);

	useEffect(() => {
		if (user?.id) {
			fetchUserPoints(user.id);
		}
	}, [user, fetchUserPoints]);

	// 既存のuseEffectとアニメーション関連のコードはそのまま維持

	const handleCharacterSelect = (character: Character) => {
		setSelectedCharacter(character);
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

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${user.id}/characters/${selectedCharacter.characterId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${initialToken}`,
					},
					body: JSON.stringify({
						life: statPoints.life,
						power: statPoints.power,
						speed: statPoints.speed,
					}),
				},
			);

			if (!response.ok) throw new Error("キャラクター育成に失敗しました");

			setAvailablePoints((prev) => prev - totalPointsUsed);
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
				const pointsToAdd = Math.min(incrementAmount, remainingPoints);
				return pointsToAdd > 0
					? { ...prev, [stat]: currentValue + pointsToAdd }
					: prev;
			} else {
				return { ...prev, [stat]: Math.max(0, currentValue - incrementAmount) };
			}
		});
	};

	// 既存のtoggleErrorStateとその他のヘルパー関数はそのまま維持

	if (!authUser) return <Loading message="認証情報を確認中..." />;
	if (isUserLoading) return <Loading message="ユーザー情報を取得中..." />;
	if (!user || userError) return <p>ユーザー情報の取得に失敗しました</p>;
	if (isCharacterListLoading)
		return <Loading message="キャラクター一覧を取得中..." />;
	if (!userCharacterList || UserCharacterError)
		return <p>キャラクター情報の取得に失敗しました</p>;

	// 残りポイントの計算
	const usedPoints = statPoints.life + statPoints.power + statPoints.speed;
	const remainingPoints = availablePoints - usedPoints;

	return (
		<MainContainer title="技術育成" icon={<ZapIcon size={40} />}>
			<TechPoint />
			<div className="flex-1 mb-4">
				<Card className="w-full border border-emerald-500/50 bg-gray-900/90">
					<CardContent className="h-full flex flex-col">
						{selectedCharacter ? (
							<div className="flex flex-col max-h-[340px]">
								{/* Character Info and Skills - Horizontal Layout */}
								<div className="flex flex-col md:flex-row gap-4">
									{/* Character Image and Basic Info */}
									<div className="flex flex-col items-center">
										<div
											className={`relative w-32 h-32 md:w-64 md:h-64 mb-2 border-2 rounded-lg overflow-hidden shadow-lg character-image-container ${
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
													transition: "opacity 0.5s ease, transform 0.5s ease",
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
													transition: "opacity 0.5s ease, transform 0.5s ease",
												}}
											>
												<Image
													src={
														characterToImagePath(
															`${selectedCharacter.characterId}-error`,
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

											{/* Canvas for noise effect */}
											{isErrorState && (
												<canvas
													ref={canvasRef}
													className="absolute inset-0 z-10 opacity-30 pointer-events-none"
												/>
											)}
										</div>
										<h2 className="text-lg font-bold text-green-400">
											{selectedCharacter.name}{" "}
											<span className="text-sm">
												【Lv.{selectedCharacter.level}】
											</span>
										</h2>
									</div>

									{/* Skills Section */}
									<div className="flex-1 h-[290px] p-3 rounded-md border border-emerald-500/30 overflow-hidden overflow-y-scroll">
										{/* タイプをスキルの上に移動 */}
										<div className="mb-3">
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

										{/* Party Skill */}
										<div className="mb-3 min-h-16">
											<div className="flex items-center gap-1 text-sm">
												<HandshakeIcon className="h-4 w-4 text-sky-400 flex-shrink-0" />
												<span className="text-sky-400 font-bold">
													パーティスキル:
												</span>
												<span className="text-white">
													{selectedCharacter.partySkillName
														? selectedCharacter.partySkillName
														: "null"}
												</span>
											</div>
											{selectedCharacter.partySkillDescription && (
												<div className="text-xs text-gray-300 ml-5 mt-1">
													{selectedCharacter.partySkillDescription}
												</div>
											)}
											{selectedCharacter.partySkillCondition && (
												<div className="text-xs text-gray-300 ml-5 mt-1">
													{selectedCharacter.partySkillCondition}
												</div>
											)}
										</div>

										{/* Passive Skill */}
										<div className="mb-3 min-h-16">
											<div className="flex items-center gap-1 text-sm">
												<ActivityIcon className="h-4 w-4 text-blue-300 flex-shrink-0" />
												<span className="text-blue-300 font-bold">
													パッシブスキル:
												</span>
												<span className="text-white">
													{selectedCharacter.passiveSkillName
														? selectedCharacter.passiveSkillName
														: "null"}
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
												<Sparkles className="h-4 w-4 text-orange-300 flex-shrink-0" />
												<span className="text-orange-300 font-bold">
													スペシャルスキル:
												</span>
												<span className="text-white">
													{selectedCharacter.specialSkillName
														? selectedCharacter.specialSkillName
														: "null"}
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

									<div className="flex-1 h-[290px] bg-gray-800/50 rounded-md border border-emerald-500/30 p-3">
										<div className="space-y-1">
											{/* HP Stat */}
											<CharacterStatusEditer
												label="HP"
												icon={
													<HeartIcon className="h-4 w-4 text-green-300 mr-1" />
												}
												baseValue={selectedCharacter.life}
												addedPoints={statPoints.life}
												onDecrement={() => handleStatChange("life", false)}
												onIncrement={() => handleStatChange("life", true)}
												canDecrement={statPoints.life > 0}
												canIncrement={remainingPoints > 0}
											/>

											{/* Power Stat */}
											<CharacterStatusEditer
												label="パワー"
												icon={
													<BicepsFlexedIcon className="h-4 w-4 text-red-300 mr-1" />
												}
												baseValue={selectedCharacter.power}
												addedPoints={statPoints.power}
												onDecrement={() => handleStatChange("power", false)}
												onIncrement={() => handleStatChange("power", true)}
												canDecrement={statPoints.power > 0}
												canIncrement={remainingPoints > 0}
											/>

											{/* Speed Stat */}
											<CharacterStatusEditer
												label="スピード"
												icon={
													<FootprintsIcon className="h-4 w-4 text-blue-300 mr-1" />
												}
												baseValue={selectedCharacter.speed}
												addedPoints={statPoints.speed}
												onDecrement={() => handleStatChange("speed", false)}
												onIncrement={() => handleStatChange("speed", true)}
												canDecrement={statPoints.speed > 0}
												canIncrement={remainingPoints > 0}
											/>

											{/* Evasion Stat (non-modifiable) */}
											<CharacterStatus
												label="回避率"
												icon={<GhostIcon />}
												value={selectedCharacter.baseEvasion}
											/>

											{/* TODO: クリティカル率を入れる */}
											<CharacterStatus
												label="クリティカル率"
												icon={<CrosshairIcon />}
												value={selectedCharacter.baseEvasion}
											/>
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
							<div className="flex items-center justify-center h-full min-h-[292px]">
								<div className="text-center w-full max-w-md">
									<div className="mb-4 text-emerald-400 opacity-50">
										<Zap className="h-16 w-16 mx-auto" />
									</div>
									<p className="text-green-200 text-lg">
										キャラクターを選択してください
									</p>
									<p className="text-green-400/50 text-sm mt-2">
										「所持技術」から育成したい技術を選んでください
									</p>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<SectionContainer title="所持技術" icon={<CpuIcon />}>
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
			</SectionContainer>
		</MainContainer>
	);
}

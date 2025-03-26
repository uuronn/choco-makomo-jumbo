"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Zap, Minus } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { useUserContext } from "../../context/UserProvider";
import type { Character, LevelUpResult } from "~/type/character";
import { enqueueSnackbar } from "notistack";

type CharacterType =
	| "バージョン管理"
	| "データベース"
	| "フレームワーク"
	| "言語"
	| "クラウド"
	| "オペレーティングシステム"
	| "実行環境"
	| "ゲームエンジン"
	| "コンテナー";

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
};

export default function CharacterDevelopment() {
	const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
		null,
	);
	const [availablePoints, setAvailablePoints] = useState(0);
	const [lifePoints, setLifePoints] = useState(0);
	const [powerPoints, setPowerPoints] = useState(0);
	const [speedPoints, setSpeedPoints] = useState(0);
	const [incrementAmount, setIncrementAmount] = useState<1 | 10 | 100>(1);

	const { user, havingCharacters, fetchCharacters } = useUserContext();

	useEffect(() => {
		if (user) {
			(async () => {
				const pointRes = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${user.uid}/point`,
				);
				const pointData = await pointRes.json();
				setAvailablePoints(pointData);
			})();
		}
	}, [user]);

	const handleCharacterSelect = (character: Character) => {
		setSelectedCharacter(character);

		setLifePoints(0);
		setPowerPoints(0);
		setSpeedPoints(0);
	};

	const handleDevelop = async () => {
		if (!selectedCharacter) return;
		(async () => {
			if (!user) return;

			const updatedCharacter = {
				...selectedCharacter,
				life: selectedCharacter.life + lifePoints,
				power: selectedCharacter.power + powerPoints,
				speed: selectedCharacter.speed + speedPoints,
			};

			setSelectedCharacter(updatedCharacter);

			const charRes = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${user.uid}/characters/${selectedCharacter.characterId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						life: lifePoints,
						power: powerPoints,
						speed: speedPoints,
					}),
				},
			);

			const data = (await charRes.json()) as LevelUpResult;
			setSelectedCharacter((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					level: data.level,
					life: data.life,
					power: data.power,
					speed: data.speed,
				};
			});
		})();

		setAvailablePoints(
			availablePoints - (lifePoints + powerPoints + speedPoints),
		);

		setLifePoints(0);
		setPowerPoints(0);
		setSpeedPoints(0);

		fetchCharacters();

		enqueueSnackbar("レベルアップ！", {
			variant: "success",
		});
	};

	const handleIncrement = (
		stateSetter: React.Dispatch<React.SetStateAction<number>>,
		currentValue: number,
	) => {
		const newValue = currentValue + incrementAmount;
		if (newValue <= remainingPoints + currentValue) {
			stateSetter(newValue);
		} else {
			stateSetter(remainingPoints + currentValue);
		}
	};

	const handleDecrement = (
		stateSetter: React.Dispatch<React.SetStateAction<number>>,
		currentValue: number,
	) => {
		const newValue = currentValue - incrementAmount;
		stateSetter(Math.max(0, newValue));
	};

	const usedPoints = lifePoints + powerPoints + speedPoints;
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
				backgroundSize: "20px 20px, 20px 20px, 20px 20px",
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
					{selectedCharacter ? (
						<Card className="w-full border border-emerald-500/50 bg-gray-900/90">
							<CardContent className="py-1 px-4">
								<div className="grid grid-cols-1 md:grid-cols-12 gap-4">
									{/* Character Image and Basic Info */}
									<div className="flex flex-col items-center justify-center md:col-span-5">
										<div
											className="relative w-48 h-48 mb-2 border-2 border-emerald-500 rounded-lg overflow-hidden shadow-lg"
											style={{ boxShadow: "0 0 10px rgba(16, 185, 129, 0.5)" }}
										>
											<Image
												src={selectedCharacter.imageUrl || "/placeholder.svg"}
												alt={selectedCharacter.name}
												fill
												className="object-cover"
											/>
										</div>
										<h2 className="text-xl font-bold text-green-400">
											{selectedCharacter.name}{" "}
											<span className="text-sm">
												【レベル{selectedCharacter.level}】
											</span>
										</h2>
										<div className="flex items-center gap-1 mt-1">
											<Badge
												className={`${
													typeColors[selectedCharacter.type as CharacterType]
												} text-white`}
											>
												{selectedCharacter.type}
											</Badge>
										</div>
										<h2 className="text-sm font-bold mt-2 text-green-400">
											{selectedCharacter.specialSkillName
												? `固有スキル: ${selectedCharacter.specialSkillName}`
												: "スキルなし"}
										</h2>
										<h2 className="text-sm font-bold mt-2 text-green-400">
											{selectedCharacter.specialSkillName
												? `内容: ${selectedCharacter.specialSkillDescription}`
												: ""}
										</h2>
										<h4 className="text-sm font-bold text-green-400">
											{selectedCharacter.specialSkillName
												? `必要ターン数: ${selectedCharacter.specialSkillTurn}`
												: ""}
										</h4>
									</div>

									{/* Character Stats */}
									<div className="col-span-2 md:col-span-7">
										<div className="mb-2">
											<div className="text-lg font-semibold mb-1 text-green-400">
												技術ポイント:{" "}
												<span className="text-emerald-400 text-xl">
													{remainingPoints}
												</span>
											</div>
											<div className="flex items-center gap-2 mb-3">
												<span className="text-sm text-green-200">増減量:</span>
												<div className="flex gap-1">
													{[1, 10, 100].map((amount) => (
														<Button
															key={amount}
															size="sm"
															variant="outline"
															className={`px-2 py-1 h-7 ${
																incrementAmount === amount
																	? "bg-emerald-500 text-gray-900 border-emerald-500"
																	: "bg-gray-800 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
															}`}
															onClick={() =>
																setIncrementAmount(amount as 1 | 10 | 100)
															}
														>
															{amount}
														</Button>
													))}
												</div>
											</div>
										</div>

										<div className="space-y-2">
											<div className="flex items-center justify-between bg-gray-800/80 p-2 rounded-md border border-emerald-500/30">
												<div className="w-20 text-green-200">HP :</div>
												<div className="flex-1 mx-2">
													<div className="text-md text-green-400">
														{selectedCharacter.life}
														{lifePoints > 0 && (
															<span className="text-emerald-400">{` (+${lifePoints})`}</span>
														)}
													</div>
												</div>
												<div className="flex items-center gap-1">
													<Button
														className="bg-gray-800 hover:bg-emerald-500 hover:text-gray-900 border border-emerald-500 text-emerald-400"
														size="icon"
														onClick={() =>
															handleDecrement(setLifePoints, lifePoints)
														}
														disabled={lifePoints <= 0}
													>
														<Minus />
													</Button>
													<Button
														className="bg-gray-800 hover:bg-emerald-500 hover:text-gray-900 border border-emerald-500 text-emerald-400"
														size="icon"
														onClick={() =>
															handleIncrement(setLifePoints, lifePoints)
														}
														disabled={remainingPoints <= 0}
													>
														<Plus />
													</Button>
													<div className="w-12 text-center text-emerald-400">
														{lifePoints}
													</div>
												</div>
											</div>

											<div className="flex items-center justify-between bg-gray-800/80 p-2 rounded-md border border-emerald-500/30">
												<div className="w-20 text-green-200">パワー:</div>
												<div className="flex-1 mx-2">
													<div className="text-md text-green-400">
														{selectedCharacter.power}
														{powerPoints > 0 && (
															<span className="text-emerald-400">{` (+${powerPoints})`}</span>
														)}
													</div>
												</div>
												<div className="flex items-center gap-1">
													<Button
														className="bg-gray-800 hover:bg-emerald-500 hover:text-gray-900 border border-emerald-500 text-emerald-400"
														size="icon"
														onClick={() =>
															handleDecrement(setPowerPoints, powerPoints)
														}
														disabled={powerPoints <= 0}
													>
														<Minus />
													</Button>
													<Button
														className="bg-gray-800 hover:bg-emerald-500 hover:text-gray-900 border border-emerald-500 text-emerald-400"
														size="icon"
														onClick={() =>
															handleIncrement(setPowerPoints, powerPoints)
														}
														disabled={remainingPoints <= 0}
													>
														<Plus />
													</Button>
													<div className="w-12 text-center text-emerald-400">
														{powerPoints}
													</div>
												</div>
											</div>

											<div className="flex items-center justify-between bg-gray-800/80 p-2 rounded-md border border-emerald-500/30">
												<div className="w-20 text-green-200">スピード:</div>
												<div className="flex-1 mx-2">
													<div className="text-md text-green-400">
														{selectedCharacter.speed}
														{speedPoints > 0 && (
															<span className="text-emerald-400">{` (+${speedPoints})`}</span>
														)}
													</div>
												</div>
												<div className="flex items-center gap-1">
													<Button
														className="bg-gray-800 hover:bg-emerald-500 hover:text-gray-900 border border-emerald-500 text-emerald-400"
														size="icon"
														onClick={() =>
															handleDecrement(setSpeedPoints, speedPoints)
														}
														disabled={speedPoints <= 0}
													>
														<Minus />
													</Button>
													<Button
														className="bg-gray-800 hover:bg-emerald-500 hover:text-gray-900 border border-emerald-500 text-emerald-400"
														size="icon"
														onClick={() =>
															handleIncrement(setSpeedPoints, speedPoints)
														}
														disabled={remainingPoints <= 0}
													>
														<Plus />
													</Button>
													<div className="w-12 text-center text-emerald-400">
														{speedPoints}
													</div>
												</div>
											</div>

											<div className="flex items-center justify-between bg-gray-800/80 p-2 rounded-md border border-emerald-500/30">
												<div className="w-20 text-green-200">回避率 :</div>
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
							</CardContent>
						</Card>
					) : (
						<div className="flex items-center justify-center h-full border-2 border-dashed border-emerald-500/30 rounded-lg p-6 bg-gray-900/80">
							<p className="text-green-200 text-md">
								キャラクターを選択してください
							</p>
						</div>
					)}
				</div>

				{/* Character List Section */}
				<div className="h-1/2 overflow-auto border rounded-lg p-4 border-emerald-500/30 bg-gray-900/80">
					<h2 className="text-xl font-bold mb-4 text-green-400 flex items-center">
						所持技術
						<div className="h-px flex-grow ml-4 bg-gradient-to-r from-emerald-400 to-transparent" />
					</h2>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
						{havingCharacters.length > 0 &&
							havingCharacters.map((character) => (
								<div
									key={character.characterId}
									className={`cursor-pointer p-2 rounded-lg transition-all ${
										selectedCharacter?.characterId === character.characterId
											? "bg-emerald-500/20 border border-emerald-500"
											: "hover:bg-gray-800 border border-emerald-500/10 hover:border-emerald-500/50"
									}`}
									style={
										selectedCharacter?.characterId === character.characterId
											? { boxShadow: "0 0 10px rgba(16, 185, 129, 0.3)" }
											: {}
									}
									onClick={() => handleCharacterSelect(character)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											handleCharacterSelect(character);
										}
									}}
									tabIndex={-1}
								>
									<div className="flex flex-col items-center">
										<div className="relative w-16 h-16 mb-2 overflow-hidden rounded-lg">
											<Image
												src={character.imageUrl || "/placeholder.svg"}
												alt={character.name}
												fill
												className="object-cover"
											/>
										</div>
										<div className="text-center font-medium text-green-200">
											{character.name}
										</div>
									</div>
								</div>
							))}
					</div>
				</div>
			</div>
		</div>
	);
}

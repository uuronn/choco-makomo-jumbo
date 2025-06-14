"use client";

import {
	ActivityIcon,
	Badge,
	BicepsFlexedIcon,
	CrosshairIcon,
	FootprintsIcon,
	GhostIcon,
	HandshakeIcon,
	HeartIcon,
	Layers,
	SparklesIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CharacterStatus } from "~/components/CharacterStatus";
import { CharacterStatusEditer } from "~/components/CharacterStatusEditer";
import { Button } from "~/components/ui/button";
import { characterToImagePath } from "~/lib/utils";

type Character = {
	characterId: string;
	name: string;
	type: string;
	level: number;
	life: number;
	power: number;
	speed: number;
	baseEvasion: number;
	partySkillName?: string;
	partySkillDescription?: string;
	partySkillCondition?: string;
	passiveSkillName?: string;
	passiveSkillDescription?: string;
	specialSkillName?: string;
	specialSkillDescription?: string;
	specialSkillTurn?: number;
};

type CharacterType = string;

const typeColors: Record<CharacterType, string> = {
	攻撃: "bg-red-500",
	防御: "bg-blue-500",
	支援: "bg-green-500",
};

export function CharacterModalClient({
	selectedCharacter,
}: {
	selectedCharacter: Character;
}) {
	const [statPoints, setStatPoints] = useState({ life: 0, power: 0, speed: 0 });
	const [isAnimating, setIsAnimating] = useState(false);
	const [isErrorState, setIsErrorState] = useState(false);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const router = useRouter();

	const usedPoints = statPoints.life + statPoints.power + statPoints.speed;
	const maxPoints = 5;
	const remainingPoints = maxPoints - usedPoints;

	const handleStatChange = (
		type: keyof typeof statPoints,
		increment: boolean,
	) => {
		setStatPoints((prev) => {
			const next = { ...prev };
			if (increment && remainingPoints > 0) next[type]++;
			else if (!increment && next[type] > 0) next[type]--;
			return next;
		});
	};

	const handleDevelop = () => {
		// 開発のロジックをここに書く（APIコールなど）
		console.log("Developing character with:", statPoints);
	};

	return (
		<div
			onKeyDown={() => {}}
			role="button"
			className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
			onClick={() => router.back()}
		>
			<div className="bg-gray-900 text-white rounded-xl shadow-xl p-6 w-full max-w-5xl relative overflow-y-auto max-h-[90vh]">
				<Button
					className="absolute top-3 right-3"
					onClick={() => router.back()}
				>
					閉じる
				</Button>
				<div className="flex flex-col md:flex-row gap-4">
					<div className="flex flex-col items-center">
						<div
							className="relative w-32 h-32 md:w-64 md:h-64 mb-2 border-2 rounded-lg overflow-hidden shadow-lg"
							style={{
								boxShadow: isErrorState
									? "0 0 15px rgba(239, 68, 68, 0.7)"
									: "0 0 10px rgba(16, 185, 129, 0.5)",
								borderColor: isErrorState ? "#ef4444" : "#10b981",
							}}
						>
							<Image
								src={
									isErrorState
										? characterToImagePath(
												`${selectedCharacter.characterId}-error`,
											)
										: characterToImagePath(selectedCharacter.characterId)
								}
								alt={selectedCharacter.name}
								fill
								className="object-cover"
								priority
							/>
							{isErrorState && (
								<canvas
									ref={canvasRef}
									className="absolute inset-0 z-10 opacity-30"
								/>
							)}
						</div>
						<h2 className="text-lg font-bold text-green-400">
							{selectedCharacter.name}【Lv.{selectedCharacter.level}】
						</h2>
					</div>

					<div className="flex-1 h-[290px] p-3 rounded-md border border-emerald-500/30 overflow-y-scroll space-y-3">
						<div className="flex items-center gap-1 text-sm">
							<Layers className="h-4 w-4 text-emerald-400" />
							<span className="font-bold">タイプ:</span>
							<Badge
								className={`ml-1 text-white ${
									typeColors[selectedCharacter.type] || "bg-gray-500"
								}`}
							>
								{selectedCharacter.type}
							</Badge>
						</div>
						<div className="text-sm">
							<HandshakeIcon className="inline h-4 w-4 text-sky-400 mr-1" />
							パーティスキル: {selectedCharacter.partySkillName || "null"}
							{selectedCharacter.partySkillDescription && (
								<div className="text-xs text-gray-300 ml-5">
									{selectedCharacter.partySkillDescription}
								</div>
							)}
							{selectedCharacter.partySkillCondition && (
								<div className="text-xs text-gray-300 ml-5">
									{selectedCharacter.partySkillCondition}
								</div>
							)}
						</div>
						<div className="text-sm">
							<ActivityIcon className="inline h-4 w-4 text-blue-300 mr-1" />
							パッシブスキル: {selectedCharacter.passiveSkillName || "null"}
							{selectedCharacter.passiveSkillDescription && (
								<div className="text-xs text-gray-300 ml-5">
									{selectedCharacter.passiveSkillDescription}
								</div>
							)}
						</div>
						<div className="text-sm">
							<SparklesIcon className="inline h-4 w-4 text-orange-300 mr-1" />
							スペシャルスキル: {selectedCharacter.specialSkillName || "null"}
							{selectedCharacter.specialSkillDescription && (
								<div className="text-xs text-gray-300 ml-5">
									{selectedCharacter.specialSkillDescription}
									{selectedCharacter.specialSkillTurn && (
										<div className="text-yellow-200">
											ターン: {selectedCharacter.specialSkillTurn}
										</div>
									)}
								</div>
							)}
						</div>
					</div>

					<div className="flex-1 h-[290px] bg-gray-800/50 rounded-md border border-emerald-500/30 p-3">
						<div className="space-y-2">
							<CharacterStatusEditer
								label="HP"
								icon={<HeartIcon className="h-4 w-4 text-green-300 mr-1" />}
								baseValue={selectedCharacter.life}
								addedPoints={statPoints.life}
								onDecrement={() => handleStatChange("life", false)}
								onIncrement={() => handleStatChange("life", true)}
								canDecrement={statPoints.life > 0}
								canIncrement={remainingPoints > 0}
							/>
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
							<CharacterStatusEditer
								label="スピード"
								icon={<FootprintsIcon className="h-4 w-4 text-blue-300 mr-1" />}
								baseValue={selectedCharacter.speed}
								addedPoints={statPoints.speed}
								onDecrement={() => handleStatChange("speed", false)}
								onIncrement={() => handleStatChange("speed", true)}
								canDecrement={statPoints.speed > 0}
								canIncrement={remainingPoints > 0}
							/>
							<CharacterStatus
								label="回避率"
								icon={<GhostIcon />}
								value={selectedCharacter.baseEvasion}
							/>
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
		</div>
	);
}

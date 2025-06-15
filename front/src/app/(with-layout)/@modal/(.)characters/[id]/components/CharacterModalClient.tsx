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
import { CharacterImage } from "~/components/CharacterImage";
import { CharacterStatus } from "~/components/CharacterStatus";
import { CharacterStatusEditer } from "~/components/CharacterStatusEditer";
import { Button } from "~/components/ui/button";
import { characterToImagePath } from "~/lib/utils";
import { CharacterAbilities } from "./CharacterAbilities";

export type Character = {
	characterId: string;
	name: string;
	type: CharacterType;
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
			<div
				onKeyDown={() => {}}
				role="button"
				onClick={(e) => e.stopPropagation()}
				className="bg-gray-900 text-white rounded-xl shadow-xl p-6 w-full max-w-5xl relative overflow-y-auto max-h-[90vh]"
			>
				<Button
					className="absolute top-3 right-3"
					onClick={() => router.back()}
				>
					閉じる
				</Button>
				<div className="flex flex-col md:flex-row gap-4">
					<div className="flex flex-col items-center">
						<CharacterImage
							selectedCharacter={selectedCharacter}
							isErrorState={isErrorState}
							canvasRef={canvasRef}
						/>
						<h2 className="text-lg font-bold text-green-400">
							{selectedCharacter.name}【Lv.{selectedCharacter.level}】
						</h2>
					</div>

					<CharacterAbilities character={selectedCharacter} />

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

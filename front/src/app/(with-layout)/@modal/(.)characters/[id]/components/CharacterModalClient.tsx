"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CharacterImage } from "~/components/CharacterImage";
import { CharacterAbilities } from "./CharacterAbilities";
import { CharacterStatsEditor } from "./CharacterStatsEditor";
import { XIcon } from "lucide-react";
import type { CharacterType } from "~/type/character";

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

export function CharacterModalClient({
	selectedCharacter,
}: {
	selectedCharacter: Character;
}) {
	const [statPoints, setStatPoints] = useState({ life: 0, power: 0, speed: 0 });
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
				<button
					type="button"
					className="absolute top-3 right-3"
					onClick={() => router.back()}
				>
					<XIcon />
				</button>

				<div className="flex flex-col md:flex-row gap-4">
					<div className="flex flex-col items-center">
						<CharacterImage
							character={selectedCharacter}
							isErrorState={isErrorState}
							canvasRef={canvasRef}
						/>
						<p className="text-lg font-bold text-green-400">
							{selectedCharacter.name}【Lv.{selectedCharacter.level}】
						</p>
					</div>

					<CharacterAbilities character={selectedCharacter} />

					<CharacterStatsEditor
						character={selectedCharacter}
						handleStatChange={handleStatChange}
						statPoints={statPoints}
						remainingPoints={remainingPoints}
						usedPoints={usedPoints}
						handleDevelop={handleDevelop}
					/>
				</div>
			</div>
		</div>
	);
}

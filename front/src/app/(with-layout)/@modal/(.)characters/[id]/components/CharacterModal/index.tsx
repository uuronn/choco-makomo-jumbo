"use client";

import { useRef, useState } from "react";
import { CharacterImage } from "~/components/CharacterImage";
import { CharacterAbilities } from "./CharacterAbilities";
import { CharacterStatsEditor } from "./CharacterStatsEditor";
import type { Character } from "~/type/character";
import { Modal } from "~/components/Modal";

export const CharacterModal = ({
	character,
}: {
	character: Character;
}) => {
	const [statPoints, setStatPoints] = useState({ life: 0, power: 0, speed: 0 });
	const [isErrorState, setIsErrorState] = useState(false);
	const canvasRef = useRef<HTMLCanvasElement>(null);

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
		<Modal>
			<div className="flex flex-col md:flex-row gap-4 min-h-fit">
				<div className="flex flex-col items-center gap-3">
					<CharacterImage
						character={character}
						isErrorState={isErrorState}
						canvasRef={canvasRef}
					/>
					<p className="text-lg font-bold text-green-400">
						{character.name}【Lv.{character.level}】
					</p>
				</div>

				<CharacterAbilities character={character} />

				<CharacterStatsEditor
					character={character}
					handleStatChange={handleStatChange}
					statPoints={statPoints}
					remainingPoints={remainingPoints}
					usedPoints={usedPoints}
					handleDevelop={handleDevelop}
				/>
			</div>
		</Modal>
	);
};

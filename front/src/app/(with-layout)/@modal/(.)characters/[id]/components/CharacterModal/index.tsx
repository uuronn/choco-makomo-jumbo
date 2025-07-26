"use client";

import { useRef, useState } from "react";
import { CharacterImage } from "~/components/CharacterImage";
import { CharacterAbilities } from "./CharacterAbilities";
import { CharacterStatsEditor } from "./CharacterStatsEditor";
import type { Character } from "~/type/character";
import { Modal } from "~/components/Modal";
import { developCharacter } from "./actions";

export const CharacterModal = ({
	character,
	userId,
	token,
}: {
	character: Character;
	userId: string;
	token: string;
}) => {
	const [statPoints, setStatPoints] = useState({ life: 0, power: 0, speed: 0 });
	const [isErrorState, _] = useState(false);
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

	return (
		<Modal>
			<div className="flex md:flex-row min-h-fit gap-2">
				<div className="flex flex-col items-center justify-start">
					<CharacterImage
						character={character}
						isErrorState={isErrorState}
						canvasRef={canvasRef}
					/>
					<p className="text-md mt-auto mb-4 font-bold text-green-400">
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
					handleDevelop={async () => {
						await developCharacter(
							userId,
							character.characterId,
							statPoints,
							token,
						);

						setStatPoints({ life: 0, power: 0, speed: 0 });
					}}
				/>
			</div>
		</Modal>
	);
};

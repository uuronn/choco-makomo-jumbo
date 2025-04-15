"use client";

// Import the new components in your main file
import CharacterImage from "./image";
import DigitalNoise from "./dig";
import GlitchEffect from "./glig";
import { useState } from "react";

interface Character {
	characterId: string;
	name: string;
	level: number;
}

interface CharacterDevelopmentProps {
	selectedCharacter: Character | null;
}

function CharacterDevelopment({
	selectedCharacter,
}: CharacterDevelopmentProps) {
	const [isGlitching, setIsGlitching] = useState(false);
	const [isErrorState, setIsErrorState] = useState(false);

	return (
		<>
			{selectedCharacter && (
				<div className="flex flex-col items-center">
					<CharacterImage
						characterId={selectedCharacter.characterId}
						name={selectedCharacter.name}
						isErrorState={isErrorState}
						onToggleErrorState={() => {
							// Add global effects when toggling
							setIsGlitching(true);
							setTimeout(() => setIsGlitching(false), 800);
							setIsErrorState((prev) => !prev);
						}}
					/>
					<h2 className="text-lg font-bold text-green-400">
						{selectedCharacter.name}{" "}
						<span className="text-sm">【Lv.{selectedCharacter.level}】</span>
					</h2>
				</div>
			)}

			<GlitchEffect isActive={isGlitching} />
			<DigitalNoise
				isActive={isErrorState}
				intensity={0.3}
				color="rgba(239, 68, 68, 0.2)"
			/>
		</>
	);
}

export default CharacterDevelopment;

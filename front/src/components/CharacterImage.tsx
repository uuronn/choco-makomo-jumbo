import Image from "next/image";
import type { RefObject } from "react";
import { characterToImagePath } from "~/lib/utils";

type Props = {
	character: {
		characterId: string;
		name: string;
	};
	isErrorState: boolean;
	canvasRef: RefObject<HTMLCanvasElement | null>;
};

export const CharacterImage = ({
	character,
	isErrorState,
	canvasRef,
}: Props) => {
	return (
		<div
			className="relative w-40 h-40 md:w-64 md:h-64 mb-2 border-2 rounded-lg overflow-hidden shadow-lg"
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
						? characterToImagePath(`${character.characterId}-error`)
						: characterToImagePath(character.characterId)
				}
				alt={character.name}
				fill
				className="object-cover"
				priority
			/>
			{isErrorState && (
				<canvas ref={canvasRef} className="absolute inset-0 z-10 opacity-30" />
			)}
		</div>
	);
};

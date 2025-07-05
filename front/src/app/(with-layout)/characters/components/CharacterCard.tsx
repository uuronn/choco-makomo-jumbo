import Image from "next/image";
import { characterToImagePath } from "~/lib/utils";
import type { Character } from "~/type/character";

type Props = {
	character: Character;
};

export const CharacterCard = ({ character }: Props) => {
	return (
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
	);
};

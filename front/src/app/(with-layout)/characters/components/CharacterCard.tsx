import Image from "next/image";
import Link from "next/link";
import { characterToImagePath } from "~/lib/utils";
import type { Character } from "~/type/character";

interface CharacterCardProps {
	character: Character;
	isSelected: boolean;
	onSelect: () => void;
}

// CharacterCardコンポーネント
export function CharacterCard({
	character,
	isSelected,
	onSelect,
}: CharacterCardProps) {
	return (
		<Link
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
			href={`/characters/${character.characterId}`}
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
		</Link>
	);
}

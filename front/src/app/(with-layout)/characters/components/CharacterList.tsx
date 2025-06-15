"use client";

import type { Character } from "~/type/character";
import { CharacterCard } from "./CharacterCard";

type Props = {
	userCharacterList: Character[] | null;
};

export default function CharacterList({ userCharacterList }: Props) {
	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
			{!userCharacterList ? (
				<div className="col-span-full text-center py-8 text-green-400/50">
					キャラクター取得中...
				</div>
			) : userCharacterList && userCharacterList.length > 0 ? (
				userCharacterList.map((character) => (
					<CharacterCard
						key={character.characterId}
						character={character}
						isSelected={
							// selectedCharacter?.characterId === character.characterId
							false
						}
						onSelect={() => {}}
						// onSelect={() => onCharacterSelect(character)}
					/>
				))
			) : (
				<div className="col-span-full text-center py-8 text-green-400/50">
					技術がありません。ガチャを引いて技術を獲得しましょう。
				</div>
			)}
		</div>
	);
}

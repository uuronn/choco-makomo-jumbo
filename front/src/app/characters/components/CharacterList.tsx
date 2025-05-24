"use client";

import { useUserCharacterList } from "~/hook/useUserCharacter";
import { useUserContext } from "~/context/UserProvider";
import { CharacterCard } from "../CharacterClient";
import type { Character } from "~/type/character";

interface CharacterListProps {
	initialToken: string;
	selectedCharacter: Character | null;
	onCharacterSelect: (character: Character) => void;
}

export default function CharacterList({
	initialToken,
	selectedCharacter,
	onCharacterSelect,
}: CharacterListProps) {
	const { user: authUser } = useUserContext();
	const { data: userCharacterList, isLoading: isCharacterListLoading } =
		useUserCharacterList(authUser?.uid ?? null, initialToken);

	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
			{isCharacterListLoading ? (
				<div className="col-span-full text-center py-8 text-green-400/50">
					キャラクター取得中...
				</div>
			) : userCharacterList && userCharacterList.length > 0 ? (
				userCharacterList.map((character) => (
					<CharacterCard
						key={character.characterId}
						character={character}
						isSelected={
							selectedCharacter?.characterId === character.characterId
						}
						onSelect={() => onCharacterSelect(character)}
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

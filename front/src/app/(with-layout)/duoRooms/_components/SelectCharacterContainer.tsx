"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SectionContainer } from "~/components/SectionContainer";
import { CharacterCard } from "../../characters/components/CharacterCard";
import type { Character } from "~/type/character";
import { getCharaList } from "../../characters/charaList";

export const SelectCharacterContainer = () => {
	const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
	const [userCharacterList, setUserCharacterList] = useState<Character[]>([]);

	const searchParams = useSearchParams();
	const router = useRouter();

	// 初期表示時にクエリから選択状態を復元
	useEffect(() => {
		const fetchUserCharacterList = async () => {
			const userCharacterList: Character[] = await getCharaList();
			setUserCharacterList(userCharacterList);

			const charParam = searchParams.get("chars");
			if (charParam) {
				const selectedIds = charParam.split(",");
				const restored = userCharacterList.filter((c) =>
					selectedIds.includes(c.characterId),
				);
				setSelectedCharacters(restored);
			}
		};

		fetchUserCharacterList();
	}, [searchParams]);

	const updateQuery = (chars: Character[]) => {
		const charIds = chars.map((c) => c.characterId).join(",");
		const url = new URL(window.location.href);
		url.searchParams.set("chars", charIds);
		router.push(url.toString());
	};

	const handleSelect = (character: Character) => {
		const isSelected = selectedCharacters.some(
			(c) => c.characterId === character.characterId,
		);

		let updated: Character[];
		if (isSelected) {
			updated = selectedCharacters.filter(
				(c) => c.characterId !== character.characterId,
			);
		} else if (selectedCharacters.length < 3) {
			updated = [...selectedCharacters, character];
		} else {
			updated = selectedCharacters;
		}

		setSelectedCharacters(updated);
		updateQuery(updated);
	};

	return (
		<div className="flex gap-4 max-h-1/2 mb-4">
			<SectionContainer title="選択中の技術" className="h-full">
				<div className="flex flex-col gap-4">
					{selectedCharacters.length > 0 ? (
						selectedCharacters.map((character) => (
							<div
								key={character.characterId}
								className="bg-gray-800/50 border border-emerald-500/30 rounded-lg p-2 text-green-300"
							>
								{character.name}（Lv.{character.level}）
							</div>
						))
					) : (
						<div className="text-green-400/50 text-center py-4">
							技術を選択してください（最大3体）
						</div>
					)}
				</div>
			</SectionContainer>

			<SectionContainer title="所持技術" className="h-full">
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
					{userCharacterList.length === 0 ? (
						<div className="col-span-full text-center py-8 text-green-400/50">
							技術がありません。ガチャを引いて技術を獲得しましょう。
						</div>
					) : (
						userCharacterList.map((character) => (
							<button
								type="button"
								key={character.characterId}
								onClick={() => handleSelect(character)}
								className={`cursor-pointer p-2 rounded-lg transition-all hover:bg-gray-800 border border-emerald-500/10 hover:border-emerald-500/50 ${
									selectedCharacters.some(
										(c) => c.characterId === character.characterId,
									)
										? "bg-gray-800 border-emerald-500/50"
										: ""
								}`}
							>
								<CharacterCard
									character={character}
									// isSelected={selectedCharacters.some(
									// 	(c) => c.characterId === character.characterId,
									// )}
								/>
							</button>
						))
					)}
				</div>
			</SectionContainer>
		</div>
	);
};

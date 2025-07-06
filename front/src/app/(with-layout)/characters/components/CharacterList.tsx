import type { Character } from "~/type/character";
import { getCharaList } from "../charaList";
import { CharacterCard } from "./CharacterCard";
import Link from "next/link";

export default async function CharacterList() {
	const userCharacterList: Character[] = await getCharaList();

	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
			{!userCharacterList ? (
				<div className="col-span-full text-center py-8 text-green-400/50">
					キャラクター取得中...
				</div>
			) : userCharacterList && userCharacterList.length > 0 ? (
				userCharacterList.map((character) => (
					<Link
						className={
							"cursor-pointer p-2 rounded-lg transition-all hover:bg-gray-800 border border-emerald-500/10 hover:border-emerald-500/50"
						}
						tabIndex={0}
						role="button"
						href={`/characters/${character.characterId}`}
						prefetch
						key={character.characterId}
					>
						<CharacterCard character={character} />
					</Link>
				))
			) : (
				<div className="col-span-full text-center py-8 text-green-400/50">
					技術がありません。ガチャを引いて技術を獲得しましょう。
				</div>
			)}
		</div>
	);
}

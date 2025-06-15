import { CharacterModal } from "./components/CharacterModal";
import { fetchCharacterById } from "./functions/fetchCharacterById";

export default async function CharacterModalPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const character = await fetchCharacterById(id);

	console.info("character", character);

	return (
		<CharacterModal
			character={{
				userId: "user123", // 仮のデータ
				id: id,
				baseSpecialSkillTurn: 3, // 仮のデータ
				characterId: id,
				name: "キャラクター名", // 仮のデータ
				type: "言語", // 仮のデータ
				level: 1, // 仮のデータ
				life: 10, // 仮のデータ
				power: 5, // 仮のデータ
				speed: 3, // 仮のデータ
				baseEvasion: 2, // 仮のデータ
				baseCritical: 1, // 仮のデータ
				partySkillName: "パーティースキル名", // 仮のデータ
				partySkillDescription: "パーティースキル説明", // 仮のデータ
				partySkillCondition: "条件", // 仮のデータ
				passiveSkillName: "パッシブスキル名", // 仮のデータ
				passiveSkillDescription: "パッシブスキル説明", // 仮のデータ
				specialSkillName: "スペシャルスキル名", // 仮のデータ
				specialSkillDescription: "スペシャルスキル説明", // 仮のデータ
				specialSkillTurn: 3, // 仮のデータ
			}}
		/>
	);
}

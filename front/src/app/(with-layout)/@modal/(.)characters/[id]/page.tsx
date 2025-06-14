import { CharacterModalClient } from "./components/CharacterModalClient";

export default async function CharacterModalPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	// const character = await fetchCharacterById(params.id);

	return (
		<CharacterModalClient
			selectedCharacter={{
				characterId: id,
				name: "キャラクター名", // 仮のデータ
				type: "攻撃", // 仮のデータ
				level: 1, // 仮のデータ
				life: 10, // 仮のデータ
				power: 5, // 仮のデータ
				speed: 3, // 仮のデータ
				baseEvasion: 2, // 仮のデータ
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

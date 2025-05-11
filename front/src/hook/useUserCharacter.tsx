import useSwr from "swr";

export type Character = {
	id: string;
	userId: string;
	characterId: string;
	level: number;
	life: number;
	power: number;
	speed: number;
	name: string;
	type: string;
	baseEvasion: number;
	specialSkillName: string;
	specialSkillDescription: string;
	specialSkillTurn: number;
	baseSpecialSkillTurn: number;
	passiveSkillName: string;
	passiveSkillDescription: string;
	partySkillName: string;
	partySkillDescription: string;
	partySkillCondition: string;
};

const fetcher = async ([_, userId, token]: [string, string, string]): Promise<
	Character[]
> => {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/characters`,
		{
			headers: { Authorization: `Bearer ${token}` },
		},
	);

	if (!res.ok) {
		throw new Error("キャラクター一覧の取得に失敗しました");
	}

	return res.json();
};

export const useUserCharacterList = (
	userId: string | null,
	token: string | null,
) => {
	return useSwr(userId ? ["characters", userId, token] : null, fetcher);
};

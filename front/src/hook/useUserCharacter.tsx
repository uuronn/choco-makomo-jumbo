import useSwr from "swr";

export type Character = {
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
	passiveSkillName: string;
	passiveSkillDescription: string;
};

const fetcher = async ([_, userId]: [string, string]): Promise<Character[]> => {
	console.info("test", userId);
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/characters`,
	);

	if (!res.ok) {
		throw new Error("キャラクター一覧の取得に失敗しました");
	}

	return res.json();
};

export const useUserCharacterList = (userId: string | null) => {
	return useSwr(userId ? ["characters", userId] : null, fetcher);
};

export type Character = {
	userId: string;
	characterId: string;
	level: number;
	life: number;
	power: number;
	speed: number;
	name: string;
	type: string;
	rarity: number;
	baseEvasion: number;
	activeSkillId: string | null;
	passiveSkillId: string | null;
	partySkillId: string | null;
	imageUrl: string;
	specialSkillType: string;
	specialSkillDescription: string;
	specialTurnRequirement: number;
};

export type LevelUpResult = {
	characterId: string;
	evasion: number;
	level: number;
	life: number;
	power: number;
	speed: number;
	userId: string;
};

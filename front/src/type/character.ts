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
	activeSkillId: string | null;
	passiveSkillId: string | null;
	partySkillId: string | null;
	imageUrl: string;
	specialSkillName: string;
	specialSkillDescription: string;
	specialSkillTurn: number;
	passiveSkillName: string;
	passiveSkillDescription: string;
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

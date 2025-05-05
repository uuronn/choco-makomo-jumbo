export type Character = {
	characterId: string;
	userId: string;
	id: string;
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
	partySkillName: string;
	partySkillDescription: string;
	partySkillCondition: string;
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

export type Character = {
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

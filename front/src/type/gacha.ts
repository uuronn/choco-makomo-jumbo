export type gachaResult = {
	message?: string;
	id: string;
	name: string;
	basePower: number;
	imageUrl: string;
	baseLife: number;
	baseSpeed: number;
	skill: string;
	created_at: string;
	updated_at: string;
	character?: { name: string };
};

export type GachaCharacter = {
	activeSkillId: string;
	baseEvasion: number;
	baseLife: number;
	basePower: number;
	baseSpeed: number;
	id: string;
	imageUrl: string;
	name: string;
	partySkillId: string | null;
	passiveSkillId: string | null;
	type: string;
};

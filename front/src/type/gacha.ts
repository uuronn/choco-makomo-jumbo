export type gachaResult = {
	message?: string;
	id: string;
	name: string;
	basePower: number;
	baseLife: number;
	baseSpeed: number;
	skill: string;
	created_at: string;
	updated_at: string;
	character?: { name: string };
};

export type GachaCharacter = {
	baseEvasion: number;
	baseLife: number;
	basePower: number;
	baseSpeed: number;
	id: string;
	name: string;
	type: string;
};

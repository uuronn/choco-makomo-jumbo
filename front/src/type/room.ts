import type { Character } from "./character";

export type Room = {
	id: string;
	hostUserId: string;
	guestUserId: string | null;
	status: string;
	currentTurnCharacterId: string;
	currentTurnUserId: string;
	room_character: RoomCharacter[];
	winUserId: string | null;
	room_log: { description: string }[];
	totalTurns: number;
	isCpuMode: boolean;
};

export type SelectingRoom = {
	id: string;
	host_user: {
		id: string;
		name: string;
		photoUrl: string;
	};
	guest_user: null | {
		id: string;
		name: string;
		photoUrl: string;
	};
	status: string;
};

export type RoomCharacter = {
	characterId: string;
	evasion: number;
	id: string;
	isActive: boolean;
	level: number;
	maxLife: number;
	life: number;
	power: number;
	roomId: string;
	speed: number;
	userId: string;
	character: Character;
	specialSkillName: string;
	passiveSkillName: string;
	passiveSkillDescription: string;
	specialUsed: 0 | 1;
};

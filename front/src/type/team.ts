import type { User } from "./user";
import type { Character } from "./character";

export type RoomCharacter = {
	id: string;
	characterId: string;
	userId: string;
	life: number;
	maxLife: number;
	isDead: boolean;
};

export type RoomLog = {
	id: string;
	roomId: string;
	actionType: string;
	description: string;
	created_at: string;
};

export type Team = {
	id: string;
	leaderUserId: string;
	memberUserId: string | null;
	status: "waiting" | "pending" | "ready";
	leaderUser: User;
	memberUser: User | null;
	characters: {
		characterId: string;
		userId: string;
		character: Character;
	}[];
	created_at: string;
	updated_at: string;
};

export type TeamRoom = {
	id: string;
	team1Id: string;
	team2Id: string | null;
	status: "waiting" | "pending" | "battling" | "finish";
	winTeamId: string | null;
	currentTurnUserId: string | null;
	currentTurnCharacterId: string | null;
	totalTurns: number;
	team1: Team;
	team2: Team | null;
	roomCharacters: RoomCharacter[];
	created_at: string;
	updated_at: string;
};

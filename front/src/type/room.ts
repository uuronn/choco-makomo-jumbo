import { Character } from "./character";

export type Room = {
  id: string;
  hostUserId: string;
  guestUserId: string | null;
  status: string;
  room_character: RoomCharacter[];
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
  life: number;
  power: number;
  roomId: string;
  speed: number;
  userId: string;
  character: Character;
};

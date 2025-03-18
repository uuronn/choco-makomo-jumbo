export type gachaResult = {
  message?: string;
  id: string;
  name: string;
  rarity: number;
  base_power: number;
  image_url: string;
  base_life: number;
  base_speed: number;
  skill: string;
  created_at: string;
  updated_at: string;
  character?: { name: string };
};

export type GachaCharacter = {
  activeSkillId: string;
  base_evasion: number;
  base_life: number;
  base_power: number;
  base_speed: number;
  id: string;
  image_url: string;
  name: string;
  partySkillId: string | null;
  passiveSkillId: string | null;
  rarity: number;
  type: string;
};

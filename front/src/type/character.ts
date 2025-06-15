export type Character = {
	characterId: string;
	userId: string;
	id: string;
	level: number;
	life: number;
	power: number;
	speed: number;
	name: string;
	type: CharacterType;
	baseEvasion: number;
	baseCritical: number;
	specialSkillName: string;
	specialSkillDescription: string;
	specialSkillTurn: number;
	baseSpecialSkillTurn: number;
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

export type CharacterType =
	| "バージョン管理"
	| "データベース"
	| "フレームワーク"
	| "言語"
	| "クラウド"
	| "オペレーティングシステム"
	| "実行環境"
	| "ゲームエンジン"
	| "コンテナー"
	| "ライブラリ";

import {
	ActivityIcon,
	BadgeIcon,
	HandshakeIcon,
	LayersIcon,
	SparklesIcon,
} from "lucide-react";
import type { Character } from "~/type/character";

type Props = {
	character: Character;
};

type CharacterType =
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

const typeColors: Record<CharacterType, string> = {
	バージョン管理: "bg-red-500",
	データベース: "bg-blue-500",
	フレームワーク: "bg-amber-700",
	言語: "bg-green-500",
	クラウド: "bg-yellow-400",
	オペレーティングシステム: "bg-purple-800",
	実行環境: "bg-pink-500",
	ゲームエンジン: "bg-indigo-500",
	コンテナー: "bg-teal-500",
	ライブラリ: "bg-gray-500",
};

export const CharacterAbilities = ({ character }: Props) => {
	return (
		<div className="flex-1 p-3 rounded-md border border-emerald-500/30 overflow-y-scroll space-y-3">
			<div className="flex items-center gap-1 text-sm">
				<LayersIcon className="h-4 w-4 text-emerald-400" />
				<span className="font-bold">タイプ：</span>
				<p
					className={`ml-1 py-0.5 px-1 rounded-sm text-white ${
						typeColors[character.type] || "bg-gray-500"
					}`}
				>
					{character.type}
				</p>
			</div>
			<div className="text-sm">
				<HandshakeIcon className="inline h-4 w-4 text-sky-400 mr-1" />
				パーティスキル: {character.partySkillName || "null"}
				{character.partySkillDescription && (
					<div className="text-xs text-gray-300 ml-5">
						{character.partySkillDescription}
					</div>
				)}
				{character.partySkillCondition && (
					<div className="text-xs text-gray-300 ml-5">
						{character.partySkillCondition}
					</div>
				)}
			</div>
			<div className="text-sm">
				<ActivityIcon className="inline h-4 w-4 text-blue-300 mr-1" />
				パッシブスキル: {character.passiveSkillName || "null"}
				{character.passiveSkillDescription && (
					<div className="text-xs text-gray-300 ml-5">
						{character.passiveSkillDescription}
					</div>
				)}
			</div>
			<div className="text-sm">
				<SparklesIcon className="inline h-4 w-4 text-orange-300 mr-1" />
				スペシャルスキル: {character.specialSkillName || "null"}
				{character.specialSkillDescription && (
					<div className="text-xs text-gray-300 ml-5">
						{character.specialSkillDescription}
						{character.specialSkillTurn && (
							<div className="text-yellow-200">
								ターン: {character.specialSkillTurn}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

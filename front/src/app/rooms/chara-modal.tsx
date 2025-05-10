"use client";

import type React from "react";
import Image from "next/image";
import {
	X,
	Shield,
	Zap,
	Activity,
	Clock,
	Info,
	Sparkles,
	Layers,
	HandshakeIcon,
	ActivityIcon,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { characterToImagePath } from "~/lib/utils";
import type { Character } from "~/type/character";

interface CharacterDetailModalProps {
	character: Character | null;
	isOpen: boolean;
	onClose: () => void;
}

// キャラクタータイプに応じた色を定義
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

export default function CharacterDetailModal({
	character,
	isOpen,
	onClose,
}: CharacterDetailModalProps) {
	if (!character) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-[90%] sm:max-w-[700px] bg-gray-900 border border-emerald-500/30 text-white p-0 overflow-hidden">
				<DialogHeader className="bg-black/40 border-b border-emerald-500/30 p-4 relative">
					<DialogTitle className="text-emerald-400 text-xl flex items-center">
						<Info className="mr-2 h-5 w-5" /> キャラクター詳細
						<div className="h-px flex-grow ml-4 bg-gradient-to-r from-emerald-400 to-transparent" />
					</DialogTitle>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="absolute right-4 top-4 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded-full h-8 w-8"
					>
						<X className="h-4 w-4" />
					</Button>
				</DialogHeader>

				<div className="p-4">
					{/* キャラクターヘッダー */}
					<div className="flex items-center mb-4 bg-black/30 p-3 rounded-lg border border-emerald-500/20">
						<div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-emerald-500/50 mr-4">
							<Image
								src={
									characterToImagePath(character.characterId) ||
									"/placeholder.svg"
								}
								alt={character.name}
								fill
								className="object-cover"
							/>
						</div>
						<div>
							<h2 className="text-xl font-bold text-emerald-400">
								{character.name}
							</h2>
							<div className="flex items-center text-emerald-400/70 text-sm">
								<Badge
									className={`${
										typeColors[character.type as CharacterType] || "bg-gray-500"
									} text-white mr-2`}
								>
									{character.type}
								</Badge>
								<span>レベル {character.level}</span>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* 左側: ステータス */}
						<div className="bg-gray-800/50 rounded-md border border-emerald-500/30 p-3">
							<h3 className="text-lg font-bold text-emerald-400 mb-3 flex items-center">
								<Activity className="h-5 w-5 mr-2" />
								ステータス
								<div className="h-px flex-grow ml-4 bg-gradient-to-r from-emerald-400 to-transparent" />
							</h3>

							<div className="space-y-2">
								{/* HP */}
								<StatRow
									icon={<Shield className="h-4 w-4 text-blue-300" />}
									label="HP"
									value={character.life}
								/>

								{/* パワー */}
								<StatRow
									icon={<Zap className="h-4 w-4 text-red-300" />}
									label="パワー"
									value={character.power}
								/>

								{/* スピード */}
								<StatRow
									icon={<Clock className="h-4 w-4 text-green-300" />}
									label="スピード"
									value={character.speed}
								/>

								{/* 回避率 */}
								<StatRow
									icon={<Sparkles className="h-4 w-4 text-yellow-300" />}
									label="回避率"
									value={`${character.baseEvasion}%`}
								/>
							</div>
						</div>

						{/* 右側: スキル */}
						<div className="bg-gray-800/50 rounded-md border border-emerald-500/30 p-3">
							<h3 className="text-lg font-bold text-emerald-400 mb-3 flex items-center">
								<Sparkles className="h-5 w-5 mr-2" />
								スキル
								<div className="h-px flex-grow ml-4 bg-gradient-to-r from-emerald-400 to-transparent" />
							</h3>

							<div className="space-y-3">
								{/* タイプ */}
								<div className="min-h-10">
									<div className="flex items-center gap-1 text-sm">
										<Layers className="h-4 w-4 text-emerald-400 flex-shrink-0" />
										<span className="text-emerald-400 font-bold">タイプ:</span>
										<span className="text-white">
											<Badge
												className={`${
													typeColors[character.type as CharacterType] ||
													"bg-gray-500"
												} text-white ml-1`}
											>
												{character.type}
											</Badge>
										</span>
									</div>
								</div>

								{/* パーティスキル */}
								<div className="min-h-16">
									<div className="flex items-center gap-1 text-sm">
										<HandshakeIcon className="h-4 w-4 text-sky-400 flex-shrink-0" />
										<span className="text-sky-400 font-bold">
											パーティスキル:
										</span>
										<span className="text-white">
											{character.partySkillName
												? character.partySkillName
												: "なし"}
										</span>
									</div>
									{character.partySkillDescription && (
										<div className="text-xs text-gray-300 ml-5 mt-1">
											{character.partySkillDescription}
										</div>
									)}
									{character.partySkillCondition && (
										<div className="text-xs text-gray-300 ml-5 mt-1">
											<span className="text-sky-200">発動条件: </span>
											{character.partySkillCondition}
										</div>
									)}
								</div>

								{/* パッシブスキル */}
								<div className="min-h-16">
									<div className="flex items-center gap-1 text-sm">
										<ActivityIcon className="h-4 w-4 text-blue-300 flex-shrink-0" />
										<span className="text-blue-300 font-bold">
											パッシブスキル:
										</span>
										<span className="text-white">
											{character.passiveSkillName
												? character.passiveSkillName
												: "なし"}
										</span>
									</div>
									{character.passiveSkillDescription && (
										<div className="text-xs text-gray-300 ml-5 mt-1">
											{character.passiveSkillDescription}
										</div>
									)}
								</div>

								{/* スペシャルスキル */}
								<div className="min-h-16">
									<div className="flex items-center gap-1 text-sm">
										<Sparkles className="h-4 w-4 text-yellow-300 flex-shrink-0" />
										<span className="text-yellow-300 font-bold">
											スペシャルスキル:
										</span>
										<span className="text-white">
											{character.specialSkillName
												? character.specialSkillName
												: "なし"}
										</span>
									</div>
									{character.specialSkillDescription && (
										<div className="text-xs text-gray-300 ml-5 mt-1">
											{character.specialSkillDescription}
										</div>
									)}
									{character.baseSpecialSkillTurn > 0 && (
										<div className="text-xs text-yellow-200 ml-5 mt-1">
											チャージターン: {character.baseSpecialSkillTurn}ターン
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// ステータス行コンポーネント
function StatRow({
	icon,
	label,
	value,
}: { icon: React.ReactNode; label: string; value: number | string }) {
	return (
		<div className="flex items-center justify-between bg-gray-800/80 p-2 rounded-md border border-emerald-500/30">
			<div className="text-green-200 flex items-center whitespace-nowrap">
				{icon}
				<span className="ml-1">{label}:</span>
			</div>
			<div className="text-lg font-bold text-emerald-400">{value}</div>
		</div>
	);
}

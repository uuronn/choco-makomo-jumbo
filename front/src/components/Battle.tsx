"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Loader2, Sword, Zap, Flag } from "lucide-react";
import type { Room, RoomCharacter } from "~/type/room";
import { useUserContext } from "~/context/UserProvider";
import { CharacterDisplay } from "./CharacterDisplay";
import Image from "next/image";
import { characterToImagePath } from "~/lib/utils";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";

type BattleProps = {
	room: Room;
	user: { id: string; name: string } | null;
};

type EffectInfo = {
	type: "blink" | string;
	endTime: number;
	resolve?: () => void; // Promise の resolve 関数を保存
};

export default function Battle({ room, user }: BattleProps) {
	// const { user } = useUserContext();

	// 前回の room を保持したい場合は useRef を使う
	// let で定義すると毎renderごとに初期化されるのでリファレンスができません。
	const prevRoomRef = useRef<Room | null>(null);

	const [loading, setLoading] = useState<boolean>(true);
	const [activeCharacter, setActiveCharacter] = useState<RoomCharacter | null>(
		null,
	);
	const [playerTeam, setPlayerTeam] = useState<RoomCharacter[]>([]);
	const [enemyTeam, setEnemyTeam] = useState<RoomCharacter[]>([]);
	const [isMyTurn, setIsMyTurn] = useState<boolean>(true);
	const [battleLog, setBattleLog] = useState<string[]>([]);
	const [isSelectingAction, setIsSelectingAction] = useState<boolean>(false);
	const [selectedAction, setSelectedAction] = useState<string | null>(null);
	const [characterEffects, setCharacterEffects] = useState<
		Record<string, EffectInfo>
	>({});
	const [showSurrenderModal, setShowSurrenderModal] = useState<boolean>(false);
	const [isSelectingEnemy, setIsSelectingEnemy] = useState<boolean>(false); // isSelectingEnemy を定義

	// スクロール位置を追跡するための状態とref
	const [userHasScrolled, setUserHasScrolled] = useState(false);
	const logContainerRef = useRef<HTMLDivElement>(null);
	const prevLogLengthRef = useRef<number>(0);

	// エフェクト表示用の関数
	const showEffect = useCallback(
		(characterId: string, type: string, duration: number) => {
			return new Promise<void>((resolve) => {
				setCharacterEffects((prevEffects) => ({
					...prevEffects,
					[characterId]: {
						type: type,
						endTime: Date.now() + duration,
						resolve: resolve, // resolve 関数を保存
					},
				}));

				// duration 後にエフェクトを削除
				setTimeout(() => {
					setCharacterEffects((prevEffects) => {
						const newEffects = { ...prevEffects };
						delete newEffects[characterId];
						return newEffects;
					});
					resolve(); // Promise を解決
				}, duration);
			});
		},
		[],
	);

	// ユーザーのスクロール操作を検出
	const handleScroll = () => {
		if (!logContainerRef.current) return;

		const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
		// 最下部からある程度離れているかどうかをチェック
		const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;

		// 最下部にいない場合はユーザーがスクロールしたと判断
		setUserHasScrolled(!isAtBottom);
	};

	// battleLog が更新されたらスクロール
	useEffect(() => {
		const logContainer = logContainerRef.current;
		if (!logContainer) return;

		// 新しいログが追加された場合のみ処理
		const hasNewLogs = battleLog.length > prevLogLengthRef.current;
		prevLogLengthRef.current = battleLog.length;

		// 新しいログが追加され、かつユーザーが手動でスクロールしていない場合、
		// または最初のレンダリング時は自動スクロール
		if (hasNewLogs && !userHasScrolled) {
			setTimeout(() => {
				if (logContainer) {
					logContainer.scrollTop = logContainer.scrollHeight;
				}
			}, 50);
		}
	}, [battleLog, userHasScrolled]);

	const isActionLog = (log: string): boolean => {
		// 行動ログを識別するキーワード
		const actionKeywords = [
			"攻撃",
			"スキル",
			"使用",
			"発動",
			"ダメージ",
			"回復",
			"防御",
			"の攻撃",
			"のスキル",
			"を使用",
			"を発動",
			"にダメージ",
			"を回復",
		];
		return actionKeywords.some((keyword) => log.includes(keyword));
	};

	// main effect: 部屋情報が変わるたびに実行
	useEffect(() => {
		// まず oldRoom をローカル変数にとっておく（前回の room）
		const oldRoom = prevRoomRef.current;
		// 今回の room を参照として保持
		prevRoomRef.current = room;

		// 初回 (oldRoom===null) の場合は差分チェック不要
		if (!oldRoom) {
			setLoading(false);
			setPlayerTeam(room.room_character.filter((ch) => ch.userId === user?.id));
			setEnemyTeam(room.room_character.filter((ch) => ch.userId !== user?.id));
			setBattleLog(room.room_log.map((log) => log.description));

			setActiveCharacter(
				room.room_character.find(
					(ch) =>
						ch.characterId === room.currentTurnCharacterId &&
						ch.userId === user?.id &&
						room.currentTurnUserId === user?.id,
				) || null,
			);
			setIsMyTurn(room.currentTurnUserId === user?.id);
			if (room.currentTurnUserId === user?.id) {
				setIsSelectingAction(true);
			} else {
				setIsSelectingAction(false);
			}
			return;
		}

		// oldRoom がある => 差分チェック
		const turnChanged =
			room.currentTurnCharacterId !== oldRoom.currentTurnCharacterId ||
			room.currentTurnUserId !== oldRoom.currentTurnUserId;

		// アクティブキャラ設定
		setActiveCharacter(
			room.room_character.find(
				(ch) =>
					ch.characterId === room.currentTurnCharacterId &&
					ch.userId === user?.id &&
					room.currentTurnUserId === user?.id,
			) || null,
		);

		// 味方・敵リスト
		setPlayerTeam(room.room_character.filter((ch) => ch.userId === user?.id));
		setEnemyTeam(room.room_character.filter((ch) => ch.userId !== user?.id));

		// ログ
		setBattleLog(room.room_log.map((log) => log.description));

		// ターンが変わった場合の処理
		if (turnChanged) {
			// ターンが変わった => ダメージ差分を調べる
			const decreasedLifeCharacters = room.room_character.filter((ch) => {
				const prevCharacter = oldRoom.room_character.find(
					(pCh) =>
						pCh.characterId === ch.characterId && pCh.userId === ch.userId,
				);
				return prevCharacter && ch.life < prevCharacter.life;
			});

			const increasedLifeCharacters = room.room_character.filter((ch) => {
				const prevCharacter = oldRoom.room_character.find(
					(pCh) =>
						pCh.characterId === ch.characterId && pCh.userId === ch.userId,
				);
				return prevCharacter && ch.life > prevCharacter.life;
			});

			if (decreasedLifeCharacters.length > 0) {
				(async () => {
					await Promise.all(
						decreasedLifeCharacters.map(async (ch) => {
							// 元のダメージエフェクトのみを表示
							await showEffect(ch.id, "explosion", 1200);
							await showEffect(ch.id, "blink", 1000);
						}),
					);
				})();
			}

			if (increasedLifeCharacters.length > 0) {
				(async () => {
					await Promise.all(
						increasedLifeCharacters.map(async (ch) => {
							await showEffect(ch.id, "heal", 2000);
						}),
					);
				})();
			}

			// アニメーション後にロード解除
			setLoading(false);
			// いったん行動選択をキャンセル
			setIsSelectingAction(false);
		}

		// "今のターンは自分か？" フラグを更新
		const nowMyTurn = room.currentTurnUserId === user?.id;
		setIsMyTurn(nowMyTurn);

		// 自分ターンなら行動選択可能にする
		if (nowMyTurn) {
			// まだ何も選んでないなら
			if (selectedAction === null) {
				setIsSelectingAction(true);
			}
		} else {
			setIsSelectingAction(false);
		}
	}, [room, user?.id, showEffect, selectedAction]);

	// useEffect(() => {
	// 	if (room?.currentTurnUserId === "00000000-0000-0000-0000-000000000cpu") {
	// 		setTimeout(() => {
	// 			fetch(
	// 				`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/${room.id}/cpu-act`,
	// 				{
	// 					method: "POST",
	// 				},
	// 			);
	// 		}, 1000); // 1秒ディレイして自然な動きに
	// 	}
	// }, [room?.currentTurnUserId]);

	useEffect(() => {
		if (
			room?.currentTurnUserId === "00000000-0000-0000-0000-000000000cpu" &&
			room?.status === "battling"
		) {
			const timer = setTimeout(() => {
				fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/${room.id}/cpu-act`,
					{
						method: "POST",
					},
				);
			}, 1000);

			return () => clearTimeout(timer);
		}
	}, [room?.currentTurnUserId, room?.currentTurnCharacterId]);

	// 敵を選択する関数
	const selectEnemy = async (characterId: string) => {
		if (!isSelectingEnemy) return;

		// 対象のキャラクターが生きているか確認
		const targetCharacter = enemyTeam.find((char) => char.id === characterId);

		// 対象キャラクターが存在し、かつライフが0より大きい場合のみ処理を続行
		if (!targetCharacter || targetCharacter.life <= 0) return;

		if (selectedAction === "attack") {
			setLoading(true);
			setSelectedAction(null);
			setIsSelectingAction(false);
			await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/${user?.id}/${room.id}/attack`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						targetCharacterId: characterId,
					}),
				},
			);
		}
		if (selectedAction === "skill") {
			setLoading(true);
			setSelectedAction(null);
			setIsSelectingAction(false);
			fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/${user?.id}/${room.id}/skill`,
				{
					method: "POST",
					body: JSON.stringify({ targetCharacterId: characterId }),
				},
			);
		}
	};

	// スキルボタンを押したとき
	const selectSkill = async () => {
		setSelectedAction("skill");
		setIsSelectingAction(false);
		const skillType = activeCharacter?.character.specialSkillName;
		const requireTarget = skillType?.includes("単体");

		// 単体対象スキルでなければ即リクエスト
		if (!requireTarget) {
			setLoading(true);
			await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/${user?.id}/${room.id}/skill`,
				{ method: "POST" },
			);
			setSelectedAction(null);
		}
	};

	return (
		<div className="min-h-screen bg-gray-900 text-green-300 p-4 flex flex-col justify-between">
			<style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        /* @keyframes float {
            0% { transform: translateY(0px) scale(1.1); }
            50% { transform: translateY(-10px) scale(1.1); }
            100% { transform: translateY(0px) scale(1.1); }
          } */
        .blink {
          animation: blink 1s infinite;
        }
        
        @keyframes shieldCountPulse {
          0% { transform: scale(1); box-shadow: 0 0 5px 2px rgba(255, 255, 255, 0.3); }
          50% { transform: scale(1.1); box-shadow: 0 0 10px 3px rgba(255, 255, 255, 0.5); }
          100% { transform: scale(1); box-shadow: 0 0 5px 2px rgba(255, 255, 255, 0.3); }
        }

        @keyframes glitch {
          0% {
            clip-path: inset(40% 0 61% 0);
            transform: translate(-2px, 2px);
          }
          20% {
            clip-path: inset(92% 0 1% 0);
            transform: translate(1px, 3px);
          }
          40% {
            clip-path: inset(43% 0 1% 0);
            transform: translate(-1px, -3px);
          }
          60% {
            clip-path: inset(25% 0 58% 0);
            transform: translate(3px, 1px);
          }
          80% {
            clip-path: inset(54% 0 7% 0);
            transform: translate(-3px, -2px);
          }
          100% {
            clip-path: inset(58% 0 43% 0);
            transform: translate(2px, -1px);
          }
        }

        @keyframes scan {
          0% {
            background-position: 0 -100vh;
          }
          35%, 100% {
            background-position: 0 100vh;
          }
        }

        @keyframes glitch-animation {
          0% {
            clip-path: inset(40% 0 61% 0);
            transform: translate(-2px, 2px);
          }
          20% {
            clip-path: inset(92% 0 1% 0);
            transform: translate(1px, 3px);
          }
          40% {
            clip-path: inset(43% 0 1% 0);
            transform: translate(-1px, -3px);
          }
          60% {
            clip-path: inset(25% 0 58% 0);
            transform: translate(3px, 1px);
          }
          80% {
            clip-path: inset(54% 0 7% 0);
            transform: translate(-3px, -2px);
          }
          100% {
            clip-path: inset(58% 0 43% 0);
            transform: translate(2px, -1px);
          }
        }

        @keyframes glitch-animation-2 {
          0% {
            clip-path: inset(25% 0 58% 0);
            transform: translate(3px, 1px);
          }
          20% {
            clip-path: inset(54% 0 7% 0);
            transform: translate(-3px, -2px);
          }
          40% {
            clip-path: inset(58% 0 43% 0);
            transform: translate(2px, -1px);
          }
          60% {
            clip-path: inset(40% 0 61% 0);
            transform: translate(-2px, 2px);
          }
          80% {
            clip-path: inset(92% 0 1% 0);
            transform: translate(1px, 3px);
          }
          100% {
            clip-path: inset(43% 0 1% 0);
            transform: translate(-1px, -3px);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        @keyframes flicker {
          0%, 100% { opacity: 1; }
          10% { opacity: 0.8; }
          20% { opacity: 0.6; }
          30% { opacity: 0.9; }
          40% { opacity: 0.4; }
          50% { opacity: 0.7; }
          60% { opacity: 0.5; }
          70% { opacity: 0.8; }
          80% { opacity: 0.3; }
          90% { opacity: 0.6; }
        }

        @keyframes digital-noise {
          0%, 100% { background-position: 0 0; }
          10% { background-position: -5% -10%; }
          20% { background-position: -15% 5%; }
          30% { background-position: 7% -25%; }
          40% { background-position: -5% 25%; }
          50% { background-position: -15% -5%; }
          60% { background-position: 15% 5%; }
          70% { background-position: 5% 15%; }
          80% { background-position: -25% 15%; }
          90% { background-position: 10% -15%; }
        }

        .error-container {
          position: relative;
          overflow: hidden;
        }

        .error-image {
          position: relative;
          z-index: 1;
        }

        .error-image-glitch {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both, 
             flicker 0.3s step-end infinite;
        }

        .error-image-glitch::before,
        .error-image-glitch::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: inherit;
          background-size: cover;
          background-position: center;
          z-index: -1;
        }

        .error-image-glitch::before {
          animation: glitch-animation 0.4s infinite linear alternate-reverse;
          left: 2px;
          text-shadow: -2px 0 #ff00ea;
          background-color: rgba(255, 0, 234, 0.2);
          mix-blend-mode: multiply;
        }

        .error-image-glitch::after {
          animation: glitch-animation-2 0.3s infinite linear alternate-reverse;
          left: -2px;
          text-shadow: 2px 0 #00ffff;
          background-color: rgba(0, 255, 255, 0.2);
          mix-blend-mode: multiply;
        }

        .digital-noise {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.05;
          z-index: 2;
          pointer-events: none;
          animation: digital-noise 0.2s steps(2) infinite;
        }

        .scan-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, 
                             transparent 0%, 
                             rgba(32, 128, 32, 0.2) 50%, 
                             transparent 100%);
          background-size: 100% 8px;
          z-index: 3;
          pointer-events: none;
          animation: scan 7s linear infinite;
        }
      `}</style>
			{/* 敵キャラ表示 */}
			<div className="flex flex-col justify-between md:min-h-[580px] md:mt-4">
				<div className="flex justify-center gap-4">
					{enemyTeam.map((character) => (
						<div
							onClick={() => selectEnemy(character.id)}
							key={character.id}
							className={`${
								isSelectingEnemy && character.life > 0
									? "hover:border-green-500 cursor-pointer"
									: ""
							} border-2 border-transparent rounded-md`}
						>
							<CharacterDisplay
								effect={characterEffects[character.id]?.type}
								isEnemy={true}
								key={character.id}
								character={character}
								onClick={() => {}}
								isActive={
									room.currentTurnCharacterId === character.characterId &&
									!isMyTurn
								}
								blockCount={character.blockCount}
								isErrorMode={
									characterEffects[character.id]?.type === "explosion"
								}
							/>
							<div className="block h-1 relative">
								{isSelectingEnemy && character.life > 0 && (
									<p className="w-full blink text-center absolute top-[4px]">
										▲
									</p>
								)}
							</div>
						</div>
					))}
				</div>
				{/* 行動できる順のUI */}
				<div className="relative min-w-[30%] mx-auto py-6 my-4">
					{/* Glowing timeline bar */}
					<div className="absolute h-2 w-full bg-gray-800 rounded-full overflow-hidden">
						<div
							className={`h-full w-full animate-pulse ${
								room.currentTurnUserId === user?.id
									? "bg-gradient-to-r from-green-500/30 via-green-400/50 to-green-500/30"
									: "bg-gradient-to-r from-red-500/30 via-red-400/50 to-red-500/30"
							}`}
						/>
					</div>

					{/* Character turn indicators */}
					<div className="flex justify-between items-center relative mt-4">
						{/* Sort characters by speed (highest first) for turn order */}
						{[...room.room_character]
							.sort((a, b) => b.speed - a.speed) // speedの降順でソート
							.filter((character) => character.isDead === false) // 死んでいないキャラのみ
							.map((character, index) => {
								const isPlayer = character.userId === user?.id;
								const isCurrentTurn =
									room.currentTurnCharacterId === character.characterId &&
									room.currentTurnUserId === character.userId; // ユーザーIDも一致するか確認

								return (
									<div
										key={character.id}
										className={`flex flex-col items-center transition-all duration-300 ${
											isCurrentTurn ? "scale-110 -translate-y-2" : ""
										}`}
										style={{
											animation: isCurrentTurn
												? "float 2s ease-in-out infinite"
												: "none",
										}}
									>
										{/* Character portrait with frame */}
										<div className={`relative ${isCurrentTurn ? "z-10" : ""}`}>
											{/* Character frame */}
											<div
												className={`relative rounded-full p-0.5 ${
													isCurrentTurn
														? isPlayer
															? "bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/30"
															: "bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/30"
														: isPlayer
															? "bg-gradient-to-br from-green-400 to-green-600"
															: "bg-gradient-to-br from-red-400 to-red-600"
												}`}
											>
												<div className="relative rounded-full overflow-hidden bg-gray-900 p-0.5">
													<Image
														src={
															characterToImagePath(character.character.id) ||
															"/placeholder.svg" ||
															"/placeholder.svg" ||
															"/placeholder.svg" ||
															"/placeholder.svg" ||
															"/placeholder.svg" ||
															"/placeholder.svg" ||
															"/placeholder.svg" ||
															"/placeholder.svg" ||
															"/placeholder.svg" ||
															"/placeholder.svg"
														}
														alt={character.character.name}
														width={46}
														height={46}
														className={`rounded-full ${
															isCurrentTurn
																? isPlayer
																	? "border-2 border-green-400"
																	: "border-2 border-red-400"
																: ""
														}`}
													/>
												</div>
											</div>

											{/* Arrow indicator for current turn */}
											{isCurrentTurn && (
												<div
													className={`absolute -top-5 left-1/2 transform -translate-x-1/2 animate-bounce ${
														isPlayer ? "text-green-400" : "text-red-400"
													}`}
												>
													▼
												</div>
											)}
										</div>

										{/* Character name */}
										<div
											className={`mt-1 text-sm font-semibold truncate max-w-[70px] text-center`}
										>
											{character.speed}
										</div>
									</div>
								);
							})}
					</div>
				</div>
				{/* 味方キャラ表示 */}
				<div className="flex justify-center gap-4 mb-4">
					{playerTeam.map((character) => (
						<CharacterDisplay
							effect={characterEffects[character.id]?.type}
							isEnemy={false}
							key={character.id}
							character={character}
							onClick={() => {}}
							isActive={
								room.currentTurnCharacterId === character.characterId &&
								isMyTurn
							}
							blockCount={character.blockCount}
							isErrorMode={characterEffects[character.id]?.type === "explosion"}
						/>
					))}
				</div>
			</div>
			<div>
				{/* ログ表示 */}
				<div className="relative">
					<div
						id="battle-log"
						ref={logContainerRef}
						onScroll={handleScroll}
						className="bg-gray-800 border border-green-500/50 rounded-lg py-2 px-4 h-32 overflow-y-auto mb-4 scrollbar-thin scrollbar-track-gray-700/30 scrollbar-thumb-green-500/30"
					>
						<div className="space-y-1">
							{battleLog.map((log, index) => (
								<div
									key={index}
									className="text-sm font-mono text-green-300 animate-in fade-in slide-in-from-bottom-2 duration-300"
									style={{
										animationDelay: `${50 * (battleLog.length - index)}ms`,
										animationFillMode: "backwards",
									}}
								>
									{log}
								</div>
							))}
						</div>
					</div>

					{/* ローディング表示 */}
					{loading && (
						<div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
							<Loader2 className="h-8 w-8 text-green-400 animate-spin" />
						</div>
					)}
				</div>
				{/* コマンドボタン */}
				<div className="grid grid-cols-2 gap-4">
					<button
						onClick={() => {
							setSelectedAction("attack");
							setIsSelectingAction(false);
							setIsSelectingEnemy(true); // 攻撃選択時に敵選択を有効にする
						}}
						className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
							isSelectingAction && !loading
								? "bg-green-700 hover:bg-green-600 text-white"
								: "bg-gray-700 text-gray-400 cursor-not-allowed"
						} transition-colors`}
						disabled={!isSelectingAction && !loading}
					>
						<Sword size={20} />
						<span>攻撃</span>
					</button>

					<button
						onClick={selectSkill}
						className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
							isSelectingAction &&
							!loading &&
							activeCharacter?.character.specialSkillName !== null &&
							(activeCharacter?.character.specialSkillTurn ?? 0) -
								room.totalTurns <=
								0 &&
							activeCharacter?.specialUsed !== 1
								? "bg-green-700 hover:bg-green-600 text-white"
								: "bg-gray-700 text-gray-400 cursor-not-allowed"
						} transition-colors`}
						disabled={
							(!isSelectingAction && !loading) ||
							activeCharacter?.character.specialSkillName === null ||
							(activeCharacter?.character.specialSkillTurn ?? 0) -
								room.totalTurns >
								0 ||
							activeCharacter?.specialUsed === 1
						}
					>
						<Zap size={20} />
						<span>スキル</span>
						<p>
							{activeCharacter?.character.specialSkillName === null
								? "スキルなし"
								: (activeCharacter?.character.specialSkillTurn ?? 0) -
											room.totalTurns >
										0
									? `残り${
											(activeCharacter?.character.specialSkillTurn ?? 0) -
											room.totalTurns
										}ターン`
									: ""}
						</p>
					</button>
				</div>
			</div>
			<button
				type="button"
				onClick={() => setShowSurrenderModal(true)}
				className="flex items-center justify-center top-[16px] right-[16px] absolute opacity-80 gap-2 p-3 rounded-lg bg-red-700 hover:bg-red-600 text-white transition-colors"
			>
				<Flag size={20} />
				{/* <span>降参</span> */}
			</button>
			{/* Surrender Modal */}
			<Dialog open={showSurrenderModal} onOpenChange={setShowSurrenderModal}>
				<DialogContent className="bg-gray-800 border border-green-500/50 text-green-300">
					<DialogHeader>
						<DialogTitle className="text-center text-xl">降参確認</DialogTitle>
						<DialogDescription className="text-center text-green-200">
							本当に降参しますか？この操作は取り消せません。
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="flex justify-center gap-4 mt-4">
						<button
							onClick={() => setShowSurrenderModal(false)}
							className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
						>
							キャンセル
						</button>
						<button
							onClick={() => {
								// Add your surrender logic here
								fetch(
									`${process.env.NEXT_PUBLIC_BASE_URL}/api/${user?.id}/${room.id}/surrender`,
									{
										method: "POST",
									},
								);
								setShowSurrenderModal(false);
							}}
							className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white transition-colors"
						>
							降参する
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

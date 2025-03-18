"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Sword, Zap } from "lucide-react";
import type { Room, RoomCharacter } from "~/type/room";
import { useUserContext } from "~/context/UserProvider";
import { CharacterDisplay } from "./CharacterDisplay";

type BattleProps = {
  room: Room;
};

type EffectInfo = {
  type: "blink" | string;
  endTime: number;
  resolve?: () => void; // Promise の resolve 関数を保存
};

export default function Battle({ room }: BattleProps) {
  const [activeCharacter, setActiveCharacter] = useState<RoomCharacter | null>(
    null,
  );
  // ここを "preventRoom" と呼んでいるが、前回の room を保持するために使うステート
  const [preventRoom, setPreventRoom] = useState<Room | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [playerTeam, setPlayerTeam] = useState<RoomCharacter[]>([]);
  const [enemyTeam, setEnemyTeam] = useState<RoomCharacter[]>([]);
  const [isMyTurn, setIsMyTurn] = useState<boolean>(true);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isSelectingAction, setIsSelectingAction] = useState<boolean>(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [characterEffects, setCharacterEffects] = useState<
    Record<string, EffectInfo>
  >({});
  const { user } = useUserContext();

  const isSelectingEnemy =
    (isMyTurn && selectedAction === "attack") ||
    (selectedAction === "skill" &&
      activeCharacter?.character.specialSkillType.includes("単体"));

  const showEffect = useCallback(
    (
      roomCharacterId: string,
      effectType: "blink" | string,
      durationMs: number,
    ): Promise<void> => {
      return new Promise<void>((resolve) => {
        const now = Date.now();
        setCharacterEffects((prev) => ({
          ...prev,
          [roomCharacterId]: {
            type: effectType,
            endTime: now + durationMs,
            resolve,
          },
        }));
      });
    },
    [],
  );

  // characterEffects の終了チェック
  useEffect(() => {
    if (Object.keys(characterEffects).length === 0) return;

    const checkEffectsInterval = setInterval(() => {
      const now = Date.now();
      let hasExpired = false;

      Object.entries(characterEffects).forEach(([characterId, effectInfo]) => {
        if (effectInfo.endTime <= now) {
          hasExpired = true;
        }
      });

      if (hasExpired) {
        setCharacterEffects((prev) => {
          const newEffects = { ...prev };
          Object.keys(newEffects).forEach((characterId) => {
            if (newEffects[characterId].endTime <= now) {
              // エフェクトが終了したら Promise を解決
              if (newEffects[characterId].resolve) {
                newEffects[characterId].resolve();
              }
              delete newEffects[characterId];
            }
          });
          return newEffects;
        });
      }
    }, 100);

    return () => clearInterval(checkEffectsInterval);
  }, [characterEffects]);

  // battleLog が更新されたらスクロール
  useEffect(() => {
    const logContainer = document.getElementById("battle-log");
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }, [battleLog]);

  // main effect: 部屋情報が変わるたびに実行
  useEffect(() => {
    // まず「前回の room」をローカル変数に保存してから、最新の room をステートに入れる
    const oldRoom = preventRoom;
    setPreventRoom(room);

    // 「前回の room」が null なら初回なので差分チェックをスキップ
    if (!oldRoom) {
      setLoading(false);
      // ただし初回でも、チーム分けなどはやっておく
      setPlayerTeam(
        room.room_character.filter((ch) => ch.userId === user?.uid),
      );
      setEnemyTeam(room.room_character.filter((ch) => ch.userId !== user?.uid));
      setBattleLog(room.room_log.map((log) => log.description));

      setActiveCharacter(
        room.room_character.find(
          (character) =>
            character.characterId === room.currentTurnCharacterId &&
            character.userId === user?.uid &&
            room.currentTurnUserId === user?.uid,
        ) || null,
      );
      setIsMyTurn(room.currentTurnUserId === user?.uid);
      if (room.currentTurnUserId === user?.uid) {
        setIsSelectingAction(true);
      } else {
        setIsSelectingAction(false);
      }
      return;
    }

    // oldRoom がある => 差分チェック（ターン変わったかなど）
    const turnChanged =
      room.currentTurnCharacterId !== oldRoom.currentTurnCharacterId ||
      room.currentTurnUserId !== oldRoom.currentTurnUserId;

    // アクティブキャラ設定
    setActiveCharacter(
      room.room_character.find(
        (ch) =>
          ch.characterId === room.currentTurnCharacterId &&
          ch.userId === user?.uid &&
          room.currentTurnUserId === user?.uid,
      ) || null,
    );

    // 味方・敵リスト
    setPlayerTeam(room.room_character.filter((ch) => ch.userId === user?.uid));
    setEnemyTeam(room.room_character.filter((ch) => ch.userId !== user?.uid));

    // ログ
    setBattleLog(room.room_log.map((log) => log.description));

    // ターンが変わった場合の処理
    if (turnChanged) {
      // ターンが変わった => ダメージ差分を調べる
      const decreasedLifeCharacters = room.room_character.filter(
        (character) => {
          const prevCharacter = oldRoom.room_character.find(
            (prevChar) => prevChar.characterId === character.characterId,
          );
          return prevCharacter && character.life < prevCharacter.life;
        },
      );

      if (decreasedLifeCharacters.length > 0) {
        (async () => {
          await Promise.all(
            decreasedLifeCharacters.map(async (character) => {
              await showEffect(character.id, "explosion", 600);
              await showEffect(character.id, "blink", 1000);
            })
          );
        })();
      }

      // ターン変わり始めの演出などが終わったらロード解除するなど
      setLoading(false);
      // いったん行動選択をキャンセル
      setIsSelectingAction(false);
    }

    // "今のターンは自分か？" フラグを更新
    const nowMyTurn = room.currentTurnUserId === user?.uid;
    setIsMyTurn(nowMyTurn);

    // "まだ行動を選択中ではない" かつ "自分のターン" の場合は、行動選択可能にする
    if (nowMyTurn) {
      // まだ何も選んでないなら
      if (selectedAction === null) {
        setIsSelectingAction(true);
      }
    } else {
      setIsSelectingAction(false);
    }
  }, [room, user?.uid, preventRoom, showEffect, selectedAction]);

  // 敵を選択する関数
  const selectEnemy = async (characterId: string) => {
    if (!isSelectingEnemy) return;
    if (selectedAction === "attack") {
      setLoading(true);
      setSelectedAction(null);
      setIsSelectingAction(false);
      await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/${user?.uid}/${room.id}/attack`,
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
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/${user?.uid}/${room.id}/skill`,
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
    const skillType = activeCharacter?.character.specialSkillType;
    const requireTarget = skillType?.includes("単体");

    // 単体対象スキルでなければ即リクエスト送る
    if (!requireTarget) {
      setLoading(true);
      await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/${user?.uid}/${room.id}/skill`,
        { method: "POST" },
      );
      setSelectedAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-green-300 p-4 flex flex-col">
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
        .blink {
          animation: blink 1s infinite;
        }
      `}</style>
      {/* 敵キャラ表示 */}
      <div className="flex justify-center gap-4 mb-auto">
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
            />
            {isSelectingEnemy && character.life > 0 && (
              <p className="w-full blink text-center">▲</p>
            )}
          </div>
        ))}
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
              room.currentTurnCharacterId === character.characterId && isMyTurn
            }
          />
        ))}
      </div>
      {/* ログ表示 */}
      <div className="relative">
        <div
          id="battle-log"
          className="bg-gray-800 border border-green-500/50 rounded-lg p-2 h-44 overflow-y-hidden mb-4"
        >
          <div className="space-y-1">
            {battleLog.map((log, index) => (
              <div key={index} className="text-sm font-mono text-green-300">
                <br />
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
            activeCharacter?.character.specialSkillType !== null &&
            (activeCharacter?.character.specialTurnRequirement ?? 0) -
              room.totalTurns <=
              0
              ? "bg-green-700 hover:bg-green-600 text-white"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          } transition-colors`}
          disabled={
            (!isSelectingAction && !loading) ||
            activeCharacter?.character.specialSkillType === null ||
            (activeCharacter?.character.specialTurnRequirement ?? 0) -
              room.totalTurns >
              0
          }
        >
          <Zap size={20} />
          <span>スキル</span>
          <p>
            {activeCharacter?.character.specialSkillType === null
              ? "スキルなし"
              : (activeCharacter?.character.specialTurnRequirement ?? 0) -
                    room.totalTurns >
                  0
                ? `残り${
                    (activeCharacter?.character.specialTurnRequirement ?? 0) -
                    room.totalTurns
                  }ターン`
                : ""}
          </p>
        </button>
      </div>
      {/* <div className="fixed top-0 right-0 w-48 h-full m-8">
        <div className="border  bg-gray-900/60 rounded-sm p-3 border-emerald-500/70 transition-all duration-200">
          <div className="flex flex-col items-center gap-4">
            <div className=" flex-shrink-0 bg-gray-800 rounded-sm overflow-hidden border border-emerald-800">
              <img
                src={activeCharacter?.character.image_url || "/placeholder.svg"}
                alt={""}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-center">
              <h3 className="text-emerald-300 font-bold">
                {activeCharacter?.character.name}
              </h3>
              <div className="px-1.5 my-2 py-0.5 bg-emerald-900/60 rounded text-xs text-emerald-400">
                {"★".repeat(activeCharacter?.character.rarity || 0)}
              </div>
              <div className="px-1.5 py-0.5 bg-emerald-900/60 rounded text-xs text-emerald-400">
                {activeCharacter?.character.type}
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}

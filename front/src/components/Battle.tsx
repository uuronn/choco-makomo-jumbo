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

  useEffect(() => {
    setActiveCharacter(
      room.room_character.find(
        (character) =>
          character.characterId === room.currentTurnCharacterId &&
          character.userId === user?.uid &&
          room.currentTurnUserId === user?.uid,
      ) || null,
    );
    if (!preventRoom) {
      setPreventRoom(room);
    }
    if (
      !(
        room.currentTurnCharacterId == preventRoom?.currentTurnCharacterId &&
        room.currentTurnUserId == preventRoom?.currentTurnUserId
      )
    ) {
      // ターンが変わった時
      if (preventRoom) {
        const decreasedLifeCharacters = room.room_character.filter(
          (character) => {
            const prevCharacter = preventRoom.room_character.find(
              (prevChar) => prevChar.characterId === character.characterId,
            );
            return prevCharacter && character.life < prevCharacter.life;
          },
        );

        if (decreasedLifeCharacters.length > 0) {
          (async () => {
            await showEffect(decreasedLifeCharacters[0].id, "explosion", 600);
            await showEffect(decreasedLifeCharacters[0].id, "blink", 1000);
          })();
        }
      }

      setPreventRoom(room);
      setLoading(false);
    }
    setPlayerTeam(
      room.room_character.filter((character) => character.userId === user?.uid),
    );
    setEnemyTeam(
      room.room_character.filter((character) => character.userId !== user?.uid),
    );
    const isMyTurn = room.currentTurnUserId === user?.uid;

    if (!isMyTurn) {
      setIsSelectingAction(false);
    } else {
      if (selectedAction === null) setIsSelectingAction(true);
    }
    setIsMyTurn(isMyTurn);
    setBattleLog(room.room_log.map((log) => log.description));
  }, [room, showEffect, user?.uid]);

  useEffect(() => {
    const logContainer = document.getElementById("battle-log");
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }, [battleLog]);

  const selectEnemy = async (characterId: string) => {
    setLoading(true);
    if (!isSelectingEnemy) return;
    if (selectedAction === "attack") {
      (async () => {
        const res = await fetch(
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
      })();
    }
    if (selectedAction === "skill") {
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/${user?.uid}/${room.id}/skill`,
        {
          method: "POST",
          body: JSON.stringify({ targetCharacterId: characterId }),
        },
      );
    }

    setSelectedAction(null);
    setIsSelectingAction(false);
  };

  const selectSkill = async () => {
    setSelectedAction("skill");
    setIsSelectingAction(false);
    const skillType = activeCharacter?.character.specialSkillType;
    const requireTarget = skillType?.includes("単体");
    if (!requireTarget) {
      setLoading(true);
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/${user?.uid}/${room.id}/skill`,
        {
          method: "POST",
        },
      );
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

        {loading && (
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-green-400 animate-spin" />
          </div>
        )}
      </div>

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
            isSelectingAction && !loading
              ? "bg-green-700 hover:bg-green-600 text-white"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          } transition-colors`}
          disabled={!isSelectingAction && !loading}
        >
          <Zap size={20} />
          <span>スキル</span>
        </button>
      </div>
    </div>
  );
}

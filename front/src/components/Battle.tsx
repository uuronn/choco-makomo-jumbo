"use client";

import { useEffect, useState, useCallback } from "react";
import { Sword, Zap } from "lucide-react";
import { Room, RoomCharacter } from "~/type/room";
import { useUserContext } from "~/context/UserProvider";
import Image from "next/image";
import React from "react";
import { CharacterDisplay } from "./CharacterDisplay";
import { log } from "console";

type BattleProps = {
  room: Room;
};

export default function Battle({ room }: BattleProps) {
  const [playerTeam, setPlayerTeam] = useState<RoomCharacter[]>([]);
  const [enemyTeam, setEnemyTeam] = useState<RoomCharacter[]>([]);
  const [charactersBySpeed, setCharactersBySpeed] = useState<RoomCharacter[]>(
    [],
  );
  const [isMyTurn, setIsMyTurn] = useState<boolean>(true);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isSelectingAction, setIsSelectingAction] = useState<boolean>(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const { user } = useUserContext();

  const isSelectingEnemy = isMyTurn && selectedAction === "attack";

  useEffect(() => {
    setPlayerTeam(
      room.room_character.filter((character) => character.userId === user?.uid),
    );
    setEnemyTeam(
      room.room_character.filter((character) => character.userId !== user?.uid),
    );
    setCharactersBySpeed(room.room_character.sort((a, b) => b.speed - a.speed));
    const isMyTurn = room.currentTurnUserId === user?.uid;

    if (!isMyTurn) {
      setIsSelectingAction(false);
    } else {
      if (selectedAction === null) setIsSelectingAction(true);
    }
    setIsMyTurn(isMyTurn);
    console.log(
      room.room_log.map((log) => log.description),
      "😄",
    );
    setBattleLog(room.room_log.map((log) => log.description));
  }, [room]);

  useEffect(() => {
    const logContainer = document.getElementById("battle-log");
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }, [battleLog]);

  const attackEnemy = async (characterId: string) => {
    if (!isSelectingEnemy) return;
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
    setSelectedAction(null);
    setIsSelectingAction(false);
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
            onClick={() => attackEnemy(character.id)}
            key={character.id}
            className={`${
              isSelectingEnemy && character.life > 0
                ? "hover:border-green-500"
                : ""
            } border-2 border-transparent rounded-md`}
          >
            <CharacterDisplay
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

      <div
        id="battle-log"
        className="bg-gray-800 border border-green-500/50 rounded-lg p-2 h-44 overflow-y-auto mb-4"
      >
        {/* <h3 className="text-green-400 font-bold mb-1 text-sm">バトルログ</h3> */}
        <div className="space-y-1">
          {battleLog.map((log, index) => (
            <div key={index} className="text-sm font-mono text-green-300">
              <br />
              {log}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => {
            setSelectedAction("attack");
            setIsSelectingAction(false);
          }}
          className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
            isSelectingAction
              ? "bg-green-700 hover:bg-green-600 text-white"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          } transition-colors`}
          disabled={!isSelectingAction}
        >
          <Sword size={20} />
          <span>攻撃</span>
        </button>
        <button
          onClick={() => {
            setSelectedAction("skill");
            setIsSelectingAction(false);
          }}
          className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
            isSelectingAction
              ? "bg-green-700 hover:bg-green-600 text-white"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          } transition-colors`}
          disabled={!isSelectingAction}
        >
          <Zap size={20} />
          <span>スキル</span>
        </button>
      </div>
    </div>
  );
}

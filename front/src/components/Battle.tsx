"use client";

import { useEffect, useState } from "react";
import { Sword, Zap } from "lucide-react";
import { Room, RoomCharacter } from "~/type/room";
import { useUserContext } from "~/context/UserProvider";
import Image from "next/image";

type BattleProps = {
  room: Room;
};

export default function Battle({ room }: BattleProps) {
  const [playerTeam, setPlayerTeam] = useState<RoomCharacter[]>([]);
  const [enemyTeam, setEnemyTeam] = useState<RoomCharacter[]>([]);

  useEffect(() => {
    setPlayerTeam(
      room.room_character.filter((character) => character.userId === user?.uid)
    );
    setEnemyTeam(
      room.room_character.filter((character) => character.userId !== user?.uid)
    );
  }, []);

  const { user } = useUserContext();

  const [battleLog, setBattleLog] = useState<string[]>(["バトル開始！"]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [selectedEnemy, setSelectedEnemy] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<"attack" | "skill" | null>(
    null
  );

  // Handle player selection
  const selectPlayer = (id: string) => {};

  // Handle enemy selection
  const selectEnemy = (id: string) => {
    if (!selectedPlayer || !currentAction) return;

    setSelectedEnemy(id);

    // Reset selections after action
    setTimeout(() => {
      setSelectedPlayer(null);
      setSelectedEnemy(null);
      setCurrentAction(null);

      // Enemy turn
      performEnemyTurn();
    }, 1000);
  };

  // Add message to battle log
  const addLogMessage = (message: string) => {
    setBattleLog((prev) => [message, ...prev].slice(0, 10));
  };

  // Enemy turn logic
  const performEnemyTurn = () => {};

  // Set action type
  const setAction = (action: "attack" | "skill") => {
    setCurrentAction(action);
    addLogMessage(`${action === "attack" ? "攻撃" : "スキル"}を選択`);
  };

  // Character component with floating animation
  const CharacterDisplay = ({
    character,
    isPlayer,
    isSelected,
    onClick,
  }: {
    character: RoomCharacter;
    isPlayer: boolean;
    isSelected: boolean;
    onClick: () => void;
  }) => {
    const hpPercentage = 11;
    let hpColor = "bg-green-500";

    if (hpPercentage < 30) {
      hpColor = "bg-red-500";
    } else if (hpPercentage < 70) {
      hpColor = "bg-yellow-500";
    }

    return (
      <div
        className={`flex flex-col items-center p-2 rounded-lg transition-all ${
          isSelected ? "scale-105" : ""
        }`}
        onClick={onClick}
      >
        <div className="relative w-full h-32 mb-2 flex items-center justify-center">
          <div
            className={`absolute inset-0 rounded-lg overflow-hidden ${
              isSelected ? "shadow-[0_0_15px_5px_rgba(74,222,128,0.5)]" : ""
            }`}
            style={{
              animation: `float 3s ease-in-out infinite`,
            }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <Image
                src={character.character.image_url || "/placeholder.svg"}
                alt={""}
                width={120}
                height={120}
                className="object-cover rounded-4xl"
              />
            </div>
          </div>
          {isSelected && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-black font-bold z-10">
              ✓
            </div>
          )}
        </div>
        <div className="w-[200px] flex flex-col justify-center items-center text-center">
          <div className="font-bold text-green-300"></div>
          <div className="w-[150px] bg-gray-800 rounded-full h-2 mt-1">
            <div
              className={`${hpColor} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${hpPercentage}%` }}
            ></div>
          </div>
          <div className="w-[200px] text-green-400 mt-1 flex justify-center items-center">
            <span className="text-lg">{character.character.name}</span>
          </div>
        </div>
      </div>
    );
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
      `}</style>

      {/* Enemy Team */}
      <div className="flex justify-center gap-4 mb-auto">
        {enemyTeam.map((enemy) => (
          <CharacterDisplay
            key={enemy.id}
            character={enemy}
            isPlayer={false}
            isSelected={selectedEnemy === enemy.id}
            onClick={() =>
              currentAction && selectedPlayer ? selectEnemy(enemy.id) : null
            }
          />
        ))}
      </div>

      {/* Player Team */}
      <div className="flex justify-center gap-4 mb-4">
        {playerTeam.map((player) => (
          <CharacterDisplay
            key={player.id}
            character={player}
            isPlayer={true}
            isSelected={selectedPlayer === player.id}
            onClick={() => {}}
          />
        ))}
      </div>

      {/* Battle Log */}
      <div className="bg-gray-800 border border-green-500/50 rounded-lg p-2 h-32 overflow-y-auto mb-4">
        <h3 className="text-green-400 font-bold mb-1 text-sm">バトルログ</h3>
        <div className="space-y-1">
          {battleLog.map((log, index) => (
            <div key={index} className="text-sm font-mono text-green-300">
              &gt; {log}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
            selectedPlayer && !currentAction
              ? "bg-green-700 hover:bg-green-600 text-white"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          } transition-colors`}
          onClick={() =>
            selectedPlayer && !currentAction ? setAction("attack") : null
          }
          disabled={!selectedPlayer || currentAction !== null}
        >
          <Sword size={20} />
          <span>攻撃</span>
        </button>
        <button
          className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
            selectedPlayer && !currentAction
              ? "bg-green-700 hover:bg-green-600 text-white"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          } transition-colors`}
          onClick={() =>
            selectedPlayer && !currentAction ? setAction("skill") : null
          }
          disabled={!selectedPlayer || currentAction !== null}
        >
          <Zap size={20} />
          <span>スキル</span>
        </button>
      </div>
    </div>
  );
}

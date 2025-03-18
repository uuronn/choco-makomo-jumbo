"use client";

import { RoomCharacter } from "~/type/room";
import Image from "next/image";
import React from "react";

export const CharacterDisplay = React.memo(
  ({
    character,
    isSelected = false,
    isEnemy,
    onClick,
  }: {
    character: RoomCharacter;
    isSelected?: boolean;
    isEnemy: boolean;
    onClick: () => void;
  }) => {
    const hpPercentage = (character.life / character.maxLife) * 100;
    let hpColor = "bg-green-500";
    if (hpPercentage < 30) {
      hpColor = "bg-red-500";
    } else if (hpPercentage < 70) {
      hpColor = "bg-yellow-500";
    }

    const auraColor = isEnemy
      ? "shadow-[0_0_15px_5px_rgba(239,68,68,0.5)]"
      : "shadow-[0_0_15px_5px_rgba(59,130,246,0.5)]";

    return (
      <div
        className={`flex flex-col items-center p-2 rounded-lg transition-all ${isSelected ? "scale-105" : ""}`}
        onClick={onClick}
      >
        <div className="relative w-full h-32 mb-2 flex items-center justify-center">
          <div
            className={`absolute inset-0 rounded-lg overflow-hidden flex justify-center items-center `}
            style={{
              animation:
                character.life > 0 ? `float 3s ease-in-out infinite` : "none",
            }}
          >
            <Image
              src={character.character.image_url || "/placeholder.svg"}
              alt=""
              width={120}
              height={120}
              className={`object-cover rounded-4xl ${auraColor}`}
              style={{
                filter: character.life === 0 ? "grayscale(100%)" : "none",
              }}
            />
          </div>
          {isSelected && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-black font-bold z-10">
              ✓
            </div>
          )}
        </div>
        <div className="w-[200px] text-green-400 flex justify-center items-center">
          <span className="text-lg">{character.character.name}</span>
        </div>
        <div className="w-[200px] flex flex-col justify-center items-center text-center">
          <div className="w-[150px] bg-gray-800 rounded-full h-2">
            <div
              className={`${hpColor} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${hpPercentage}%` }}
            ></div>
          </div>
          <span className="text-xs mt-1">HP {character.life}</span>

          <span className="text-xs">パワー {character.power}</span>

          <span className="text-xs">スピード {character.speed}</span>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.character === nextProps.character &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isEnemy === nextProps.isEnemy
    );
  },
);

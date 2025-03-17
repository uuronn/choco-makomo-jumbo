"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Zap } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { useAuth } from "../context/AuthProvider";
import { Character } from "~/type/character";

// Character type definition
type CharacterType =
  | "バージョン管理"
  | "Water"
  | "Earth"
  | "Wind"
  | "Light"
  | "Dark"; // あとでバリエーション追加

// Type color mapping
const typeColors: Record<CharacterType, string> = {
  バージョン管理: "bg-red-500",
  Water: "bg-blue-500",
  Earth: "bg-amber-700",
  Wind: "bg-green-500",
  Light: "bg-yellow-400",
  Dark: "bg-purple-800",
};

export default function CharacterDevelopment() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );
  const [availablePoints, setAvailablePoints] = useState(0);
  const [lifePoints, setLifePoints] = useState(0);
  const [powerPoints, setPowerPoints] = useState(0);
  const [speedPoints, setSpeedPoints] = useState(0);

  const { user } = useAuth();

  // キャラクター一覧取得
  useEffect(() => {
    if (user) {
      (async () => {
        // キャラクター一覧を取得
        const charRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${user.uid}/characters`
        );
        const charData = await charRes.json();
        setCharacters(charData);
      })();
      (async () => {
        // キャラクター一覧を取得
        const pointRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${user.uid}/point`
        );
        const pointData = await pointRes.json();
        setAvailablePoints(pointData);
      })();
    }
  }, [user]);

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    // Reset points when selecting a new character
    setLifePoints(0);
    setPowerPoints(0);
    setSpeedPoints(0);
  };

  const handleDevelop = async () => {
    if (!selectedCharacter) return;

    (async () => {
      if (!user) return;
      // キャラクター一覧を取得
      const charRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${user.uid}/characters/${selectedCharacter.characterId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            life: lifePoints,
            power: powerPoints,
            speed: speedPoints,
          }),
        }
      );
    })();

    // Update character stats
    const updatedCharacter = {
      ...selectedCharacter,
      life: selectedCharacter.life + lifePoints,
      power: selectedCharacter.power + powerPoints,
      speed: selectedCharacter.speed + speedPoints,
    };

    setSelectedCharacter(updatedCharacter);

    // Update available points
    setAvailablePoints(
      availablePoints - (lifePoints + powerPoints + speedPoints)
    );

    // Reset allocated points
    setLifePoints(0);
    setPowerPoints(0);
    setSpeedPoints(0);
  };

  const usedPoints = lifePoints + powerPoints + speedPoints;
  const remainingPoints = availablePoints - usedPoints;

  return (
    <div
      className="bg-gray-900 min-h-screen"
      style={{
        backgroundImage: `
        radial-gradient(rgba(16, 185, 129, 0.15) 1px, transparent 1px),
        linear-gradient(to right, rgba(16, 185, 129, 0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(16, 185, 129, 0.05) 1px, transparent 1px)
      `,
        backgroundSize: "20px 20px, 20px 20px, 20px 20px",
      }}
    >
      <div className="container mx-auto p-4 flex flex-col h-screen max-h-screen">
        <h1 className="text-2xl font-bold mb-4 text-green-400 flex items-center">
          <Zap className="mr-2 h-6 w-6 text-emerald-400" />
          キャラクター育成
          <div className="h-px flex-grow ml-4 bg-gradient-to-r from-emerald-400 to-transparent"></div>
        </h1>

        {/* Character Status Section */}
        <div className="flex-1 mb-4 overflow-auto">
          {selectedCharacter ? (
            <Card className="w-full border border-emerald-500/50 bg-gray-900/90">
              <CardContent className="py-2 px-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Character Image and Basic Info */}
                  <div className="flex flex-col items-center justify-center md:col-span-5">
                    <div
                      className="relative w-40 h-40 mb-4 border-2 border-emerald-500 rounded-lg overflow-hidden shadow-lg"
                      style={{ boxShadow: "0 0 15px rgba(16, 185, 129, 0.5)" }}
                    >
                      <Image
                        src={selectedCharacter.image_url || "/placeholder.svg"}
                        alt={selectedCharacter.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h2 className="text-xl font-bold text-green-400">
                      {selectedCharacter.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        className={`${typeColors[selectedCharacter.type as CharacterType]} text-white`}
                      >
                        {selectedCharacter.type}
                      </Badge>
                      <div className="flex">
                        {Array.from({ length: selectedCharacter.rarity }).map(
                          (_, i) => (
                            <span key={i} className="text-emerald-400">
                              ★
                            </span>
                          )
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-green-200">
                      レベル: {selectedCharacter.level}
                    </div>
                  </div>

                  {/* Character Stats */}
                  <div className="col-span-2 md:col-span-7">
                    <div className="mb-4">
                      <div className="text-lg font-semibold mb-2 text-green-400">
                        所持ポイント:{" "}
                        <span className="text-emerald-400">
                          {remainingPoints}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-gray-800/80 p-3 rounded-md border border-emerald-500/30">
                        <div className="w-24 text-green-200">ライフ:</div>
                        <div className="flex-1 mx-4">
                          <div className="text-lg text-green-400">
                            {selectedCharacter.life}
                            {lifePoints > 0 && (
                              <span className="text-emerald-400">{` (+${lifePoints})`}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            className="bg-gray-800 hover:bg-emerald-500 hover:text-gray-900 border border-emerald-500 text-emerald-400"
                            size="icon"
                            onClick={() =>
                              remainingPoints > 0 &&
                              setLifePoints(lifePoints + 1)
                            }
                            disabled={remainingPoints <= 0}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <div className="w-8 text-center text-emerald-400">
                            {lifePoints}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-gray-800/80 p-3 rounded-md border border-emerald-500/30">
                        <div className="w-24 text-green-200">パワー:</div>
                        <div className="flex-1 mx-4">
                          <div className="text-lg text-green-400">
                            {selectedCharacter.power}
                            {powerPoints > 0 && (
                              <span className="text-emerald-400">{` (+${powerPoints})`}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            className="bg-gray-800 hover:bg-emerald-500 hover:text-gray-900 border border-emerald-500 text-emerald-400"
                            size="icon"
                            onClick={() =>
                              remainingPoints > 0 &&
                              setPowerPoints(powerPoints + 1)
                            }
                            disabled={remainingPoints <= 0}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <div className="w-8 text-center text-emerald-400">
                            {powerPoints}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-gray-800/80 p-3 rounded-md border border-emerald-500/30">
                        <div className="w-24 text-green-200">スピード:</div>
                        <div className="flex-1 mx-4">
                          <div className="text-lg text-green-400">
                            {selectedCharacter.speed}
                            {speedPoints > 0 && (
                              <span className="text-emerald-400">{` (+${speedPoints})`}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            className="bg-gray-800 hover:bg-emerald-500 hover:text-gray-900 border border-emerald-500 text-emerald-400"
                            size="icon"
                            onClick={() =>
                              remainingPoints > 0 &&
                              setSpeedPoints(speedPoints + 1)
                            }
                            disabled={remainingPoints <= 0}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <div className="w-8 text-center text-emerald-400">
                            {speedPoints}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="mt-6 w-full bg-emerald-500 text-gray-900 hover:bg-green-400 font-bold"
                      style={{ boxShadow: "0 0 10px rgba(16, 185, 129, 0.5)" }}
                      onClick={handleDevelop}
                      disabled={usedPoints === 0}
                    >
                      育成する
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full border-2 border-dashed border-emerald-500/30 rounded-lg p-8 bg-gray-900/80">
              <p className="text-green-200 text-lg">
                キャラクターを選択してください
              </p>
            </div>
          )}
        </div>

        {/* Character List Section */}
        <div className="h-1/3 overflow-auto border rounded-lg p-4 border-emerald-500/30 bg-gray-900/80">
          <h2 className="text-xl font-bold mb-4 text-green-400 flex items-center">
            キャラクター一覧
            <div className="h-px flex-grow ml-4 bg-gradient-to-r from-emerald-400 to-transparent"></div>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {characters.map((character) => (
              <div
                key={character.characterId}
                className={`cursor-pointer p-2 rounded-lg transition-all ${
                  selectedCharacter?.characterId === character.characterId
                    ? "bg-emerald-500/20 border border-emerald-500"
                    : "hover:bg-gray-800 border border-emerald-500/10 hover:border-emerald-500/50"
                }`}
                style={
                  selectedCharacter?.characterId === character.characterId
                    ? { boxShadow: "0 0 10px rgba(16, 185, 129, 0.3)" }
                    : {}
                }
                onClick={() => handleCharacterSelect(character)}
              >
                <div className="flex flex-col items-center">
                  <div className="relative w-16 h-16 mb-2 overflow-hidden rounded-lg">
                    <Image
                      src={character.image_url || "/placeholder.svg"}
                      alt={character.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-center font-medium text-green-200">
                    {character.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

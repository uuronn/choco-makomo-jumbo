"use client";

import { useState } from "react";
import Image from "next/image";
import { Shield, Plus, Users, ChevronRight } from "lucide-react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useAuth } from "~/context/AuthProvider";
import { Character } from "~/type/character";

type Room = {
  id: number;
  name: string;
  image: string;
  players: number;
  maxPlayers: number;
};

const rooms: Room[] = [
  {
    id: 1,
    name: "ナイトシティ強盗",
    image: "/placeholder.svg?height=120&width=200",
    players: 2,
    maxPlayers: 4,
  },
  {
    id: 2,
    name: "荒坂タワー",
    image: "/placeholder.svg?height=120&width=200",
    players: 1,
    maxPlayers: 3,
  },
  {
    id: 3,
    name: "バッドランズラン",
    image: "/placeholder.svg?height=120&width=200",
    players: 0,
    maxPlayers: 4,
  },
  {
    id: 4,
    name: "カブキ市場",
    image: "/placeholder.svg?height=120&width=200",
    players: 3,
    maxPlayers: 6,
  },
];

export default function GameInterface() {
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const { havingCharacters } = useAuth();

  const handleSelectCharacter = (character: Character) => {
    if (
      selectedCharacters.find((c) => c.characterId === character.characterId)
    ) {
      setSelectedCharacters(
        selectedCharacters.filter(
          (c) => c.characterId !== character.characterId,
        ),
      );
    } else if (selectedCharacters.length < 3) {
      setSelectedCharacters([...selectedCharacters, character]);
    }
  };

  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
  };

  const isButtonDisabled = selectedCharacters.length === 0;

  return (
    <div className="h-screen bg-gray-900 text-white p-3 flex flex-col overflow-hidden pl-20">
      {/* キャラクター選択セクション */}
      <section className="border border-green-400/30 rounded-lg p-3 backdrop-blur-sm backdrop-filter bg-black/20 h-[55%] overflow-hidden mb-3">
        <h2 className="text-lg font-bold mb-2 text-green-400 flex items-center">
          <Shield className="mr-2 h-5 w-5" /> キャラクター選択{" "}
          <span className="text-sm ml-2 text-green-400/70">(最大3体)</span>
        </h2>

        <div className="grid grid-cols-2 gap-3 h-[calc(100%-30px)]">
          {/* 選択されたキャラクター */}
          <div className="space-y-1 overflow-auto">
            <h3 className="text-xs font-semibold text-green-400/80">
              選択中のキャラクター
            </h3>
            <div className="h-[calc(100%-22px)] border border-green-400/20 rounded-lg p-2 bg-black/30 overflow-auto">
              {selectedCharacters.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <p>キャラクターが選択されていません</p>
                </div>
              ) : (
                selectedCharacters.map((character) => (
                  <div
                    key={character.characterId}
                    className="flex h-[calc(33.33%-6px)] items-center p-1.5 rounded-md bg-green-400/10 border border-green-400/30 hover:bg-green-400/20 transition-all cursor-pointer mb-2 last:mb-0"
                    onClick={() => handleSelectCharacter(character)}
                  >
                    <div className="relative h-10 w-10 mr-3 rounded-md overflow-hidden border border-green-400/50">
                      <Image
                        src={character.image_url || "/placeholder.svg"}
                        alt={character.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-400">
                        {character.name}
                      </h4>
                      <p className="text-xs text-green-400/70">
                        レベル {character.level}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <Plus className="rotate-45 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* キャラクター一覧 */}
          <div className="space-y-1 overflow-hidden">
            <h3 className="text-xs font-semibold text-green-400/80">
              利用可能なキャラクター
            </h3>
            <div className="h-[calc(100%-22px)] overflow-auto pb-2">
              <div className="flex flex-wrap gap-3 content-start">
                {havingCharacters.map((character) => (
                  <div
                    key={character.characterId}
                    className={cn(
                      "flex flex-col justify-center items-center p-1.5 rounded-lg border transition-all cursor-pointer h-[150px] w-[150px]",
                      selectedCharacters.find(
                        (c) => c.characterId === character.characterId,
                      )
                        ? "bg-green-400/20 border-green-400"
                        : "bg-black/30 border-green-400/20 hover:bg-green-400/10",
                    )}
                    onClick={() => handleSelectCharacter(character)}
                  >
                    <div className="relative h-12 w-12 mb-1 rounded-full overflow-hidden border-2 border-green-400/50">
                      <Image
                        src={character.image_url || "/placeholder.svg"}
                        alt={character.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h4 className="font-bold text-center text-green-400 text-sm">
                      {character.name}
                    </h4>
                    <p className="text-xs text-green-400/70">
                      レベル {character.level}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ルーム選択セクション */}
      <section className="border border-green-400/30 rounded-lg p-3 backdrop-blur-sm backdrop-filter bg-black/20 h-[42%] overflow-hidden">
        <h2 className="text-lg font-bold mb-2 text-green-400 flex items-center">
          <Users className="mr-2 h-5 w-5" /> ルーム選択
        </h2>

        <div className="space-y-3 h-[calc(100%-40px)]">
          {/* ルーム一覧 */}
          <div className="overflow-x-auto h-[calc(100%-40px)]">
            <div className="flex h-full gap-4 items-center">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className={cn(
                    "flex flex-col rounded-lg border transition-all cursor-pointer min-w-[200px]  min-h-[160px] overflow-hidden",
                    selectedRoom?.id === room.id
                      ? "bg-green-400/20 border-green-400"
                      : "bg-black/30 border-green-400/20 hover:bg-green-400/10",
                  )}
                  onClick={() => handleSelectRoom(room)}
                >
                  <div className="relative h-[90px] w-full">
                    <Image
                      src={room.image || "/placeholder.svg"}
                      alt={room.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-3 py-1 text-xs text-green-400">
                      プレイヤー: {room.players}/{room.maxPlayers}
                    </div>
                  </div>
                  <div className="p-2">
                    <h4 className="font-bold text-green-400 text-sm">
                      {room.name}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              className="border-green-400 text-green-400 hover:bg-green-400/20 text-sm h-9"
              disabled={isButtonDisabled}
            >
              <Plus className="mr-1 h-4 w-4" /> ルーム作成
            </Button>
            <Button
              className="bg-green-400 text-black hover:bg-green-500 text-sm h-9"
              disabled={isButtonDisabled || !selectedRoom}
            >
              入室 <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

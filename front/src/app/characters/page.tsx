"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import Image from "next/image";
import { Character } from "~/type/character";
import Loading from "~/components/Loading";

export default function CharacterListPage() {
  const { user } = useAuth();

  const [characterList, setCharacterList] = useState<Character[]>([]);

  useEffect(() => {
    if (user) {
      (async () => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${user.uid}/characters`,
        );
        if (!res.ok) {
          throw new Error("キャラクターの取得に失敗しました");
        }

        const data = await res.json();
        console.log(data, "😄");
        setCharacterList(data);
      })();
    }
  }, [user]);

  if (!user) return <Loading message="認証中" />;

  return (
    <div className="min-h-screen text-black flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">キャラ一覧</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {characterList.map((character: Character) => (
          <div
            key={`${character.userId}-${character.characterId}`}
            className="bg-white p-4 rounded-lg shadow"
          >
            <h2 className="text-xl font-semibold">{character.name}</h2>
            <Image
              src={character.image_url}
              alt="test"
              width={100}
              height={100}
            />
            <p>タイプ：{character.type}</p>
            <p>レア度: {character.rarity}</p>
            <p>レベル: {character.level}</p>
            <p>ライフ: {character.life}</p>
            <p>パワー: {character.power}</p>
            <p>スピード: {character.speed}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

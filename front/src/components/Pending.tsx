"use client";

import { useEffect, useState } from "react";
import { Check, X, User, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import Image from "next/image";
import { Room } from "~/type/room";
import { useAuth } from "~/context/AuthProvider";

type Player = {
  id: string;
  name: string;
  avatar: string;
};

type PendingProps = {
  room: Room;
  setRoom: (room: Room) => void;
};

export default function Pending({ room, setRoom }: PendingProps) {
  const [name, setName] = useState<string>("Guest");
  const [img, setImg] = useState<string>("/placeholder.svg");

  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      // キャラクター一覧を取得
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${room.guestUserId}`
      );
      const data = await res.json();

      setImg(data.photoUrl);
      setName(data.name);
    })();
  }, []);

  const handleAccept = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/${user?.uid}/${room.id}/approve`,
      {
        method: "POST",
      }
    );
    const data = await res.json();
  };

  const handleReject = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/${user?.uid}/${room.id}/reject`,
      {
        method: "POST",
      }
    );
    const data = await res.json();
    console.log(data);

    // roomのguestUserIdをnullに設定
    setRoom({ ...room, guestUserId: null });
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-black/90 rounded-lg overflow-hidden">
      {/* サイバー風の背景エフェクト */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,170,0.1)_0,rgba(0,0,0,0)_70%)]"></div>
      <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-20 pointer-events-none">
        {Array.from({ length: 144 }).map((_, i) => (
          <div key={i} className="border border-green-500/20"></div>
        ))}
      </div>

      {/* グロー効果 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/20 blur-3xl rounded-full"></div>

      <div className="relative z-10 w-full max-w-xs px-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-400 tracking-wider">
            対戦相手
          </h1>
          <div className="h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent mt-2"></div>
        </div>
        <Card className="border-green-500/50 bg-black/60 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,170,0.3)]">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <h1 className="text-xl font-bold text-green-400 tracking-wider  mb-6">
              {name}
            </h1>
            <div className="flex flex-col items-center">
              <Image
                width={100}
                height={100}
                src={img}
                alt={room.guestUserId ?? "Guest"}
                className="object-cover rounded-full"
              />
              <div className="mt-6 flex gap-4 w-full">
                <Button
                  onClick={handleReject}
                  className="flex-1 bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700 z-100"
                >
                  <X className="mr-2 h-5 w-5" />
                  拒否
                </Button>
                <Button
                  onClick={handleAccept}
                  className="flex-1 bg-green-900/60 hover:bg-green-800 text-green-200 border border-green-700 z-100"
                >
                  <Check className="mr-2 h-5 w-5" />
                  承諾
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center"></div>
      </div>
    </div>
  );
}

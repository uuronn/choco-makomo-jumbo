"use client";

import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Trophy, HomeIcon } from "lucide-react";
import confetti from "canvas-confetti";
import { LuSwords } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { useUserContext } from "~/context/UserProvider";

export default function Victory({ roomId }: { roomId: string }) {
  const [showScreen, setShowScreen] = useState(false);

  const { user } = useUserContext();

  const router = useRouter();

  useEffect(() => {
    // Trigger animations in sequence
    setTimeout(() => setShowScreen(true), 100);
    setTimeout(() => {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10B981", "#059669", "#34D399", "#A7F3D0"],
      });
    }, 600);
    (async () => {
      await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/${user?.uid}/${roomId}/delete`,
        {
          method: "DELETE",
        },
      );
    })();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <div className="absolute inset-0 overflow-hidden">
        {/* Cyber grid background */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="h-full w-full bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        </div>

        {/* Glowing orbs in background */}
        <div className="absolute left-1/4 top-1/4 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-3xl"></div>
      </div>

      <Card
        className={`relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-emerald-500/20 bg-black/80 p-6 shadow-[0_0_15px_rgba(16,185,129,0.5)] backdrop-blur-sm transition-all duration-500 ${
          showScreen ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-emerald-500/30 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-emerald-500/30 blur-3xl"></div>

        {/* Victory header */}
        <div className="mb-6 text-center">
          <div className="mb-2 flex justify-center">
            <Trophy className="h-12 w-12 text-emerald-400" />
          </div>
          <h1 className="text-center font-mono text-4xl font-bold uppercase tracking-wider text-white">
            <span className="mr-2 inline-block animate-pulse text-emerald-400">
              [
            </span>
            VICTORY
            <span className="ml-2 inline-block animate-pulse text-emerald-400">
              ]
            </span>
          </h1>
          <div className="mt-2 text-emerald-400">勝利</div>
        </div>

        <Button
          onClick={() => {
            router.push("/rooms");
          }}
          className="cursor-pointer col-span-2 border border-emerald-500/30 bg-transparent text-emerald-400 hover:bg-emerald-500/10"
        >
          <LuSwords />
          対戦へ
        </Button>
        <Button
          onClick={() => {
            router.push("/");
          }}
          className="cursor-pointer col-span-2 border border-emerald-500/30 bg-transparent text-emerald-400 hover:bg-emerald-500/10"
        >
          <HomeIcon className=" h-4 w-4" />
          ホームへ
        </Button>

        {/* Cyber decorative elements */}
        <div className="absolute bottom-0 left-0 h-1 w-1/3 bg-gradient-to-r from-emerald-500 to-transparent"></div>
        <div className="absolute right-0 top-0 h-1 w-1/3 bg-gradient-to-l from-emerald-500 to-transparent"></div>
        <div className="absolute bottom-6 right-6 h-20 w-1 animate-pulse bg-emerald-500/50"></div>
        <div className="absolute left-6 top-6 h-1 w-20 animate-pulse bg-emerald-500/50"></div>
      </Card>
    </div>
  );
}

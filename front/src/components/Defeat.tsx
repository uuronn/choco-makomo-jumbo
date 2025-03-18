"use client";

import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Skull, HomeIcon } from "lucide-react";
import { LuSwords } from "react-icons/lu";
import { useRouter } from "next/navigation";

export default function Defeat() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <div className="absolute inset-0 overflow-hidden">
        {/* Cyber grid background */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="h-full w-full bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        </div>

        {/* Glowing orbs in background */}
        <div className="absolute left-1/4 top-1/4 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/20 blur-3xl"></div>
      </div>

      <Card
        className={`relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-emerald-500/20 bg-black/80 p-6 shadow-[0_0_15px_rgba(239,68,68,0.3)] backdrop-blur-sm transition-all duration-500 scale-100 opacity-100 translate-x-[3px]`}
      >
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-red-500/20 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl"></div>
        {/* Defeat header */}
        <div className={`mb-6 text-center`}>
          <div className="mb-2 flex justify-center">
            <Skull className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-center font-mono text-4xl font-bold uppercase tracking-wider text-white">
            <span className="mr-2 inline-block animate-pulse text-red-500">
              [
            </span>
            DEFEAT
            <span className="ml-2 inline-block animate-pulse text-red-500">
              ]
            </span>
          </h1>
          <div className="mt-2 text-red-400">敗北</div>
        </div>
        <Button
          onClick={() => {
            router.push("/rooms");
          }}
          className="cursor-pointer col-span-2 border border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10"
        >
          <LuSwords />
          対戦へ
        </Button>
        <Button
          onClick={() => {
            router.push("/");
          }}
          className="cursor-pointer col-span-2 border border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10"
        >
          <HomeIcon className=" h-4 w-4" />
          ホームへ
        </Button>
      </Card>
    </div>
  );
}

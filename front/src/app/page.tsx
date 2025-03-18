"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import {
  Cpu,
  Terminal,
  Swords,
  Brain,
  Gift,
  Coins,
  ChevronRight,
  User,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { useUserContext } from "~/context/UserProvider";
import { SlEnergy } from "react-icons/sl";
import { FaLaptopCode } from "react-icons/fa";

export default function HomeScreen() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const { user, handleSignOut } = useUserContext();

  // ナビゲーションアイテム
  const navItems = [
    {
      id: "battle",
      title: "対戦",
      description: "他のプレイヤーと技術力を競え！",
      icon: <Swords className="h-8 w-8" />,
      color: "from-red-500/80 to-orange-500/80",
      path: "/rooms",
    },
    {
      id: "training",
      title: "育成",
      description: "技術をレベルアップ",
      icon: <SlEnergy className="h-8 w-8" />,
      color: "from-blue-500/80 to-cyan-500/80",
      path: "/characters",
    },
    {
      id: "gacha",
      title: "ガチャ",
      description: "新しい技術を獲得しよう",
      icon: <FaLaptopCode className="h-8 w-8" />,
      color: "from-purple-500/80 to-pink-500/80",
      path: "/gacha",
    },
    {
      id: "points",
      title: "ポイ活",
      description: "クイズに正解してポイントゲット",
      icon: <Coins className="h-8 w-8" />,
      color: "from-yellow-500/80 to-amber-500/80",
      path: "/quiz",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2MmgtMnYtMnptLTQgMHYyaC0ydi0yaDJ6bTIgMGgydjJoLTJ2LTJ6bS02IDBoMnYyaC0ydi0yem0yLTRoMnYyaC0ydi0yem0yIDBIMzZ2Mmgtc3YtMnptMCA0aDJ2MmgtMnYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')]"></div>

      {/* Animated circuit lines */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse"></div>
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-green-500 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse"></div>
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-green-500 to-transparent animate-pulse"></div>
      </div>

      <div className="w-full max-w-2xl bg-black/80 backdrop-blur-sm rounded-xl shadow-[0_0_15px_rgba(0,255,128,0.3)] border border-green-500/30 overflow-hidden relative z-10">
        {/* User Profile */}
        <div className="border-b border-green-500/30 bg-black/50 p-4 flex">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                src={user?.photoURL || "/placeholder.svg"}
                alt={""}
                width={50}
                height={50}
                className="object-cover rounded-4xl"
              />
            </div>

            <div>
              <div className="text-xl font-bold text-green-300 font-mono">
                {user?.displayName}
              </div>
              <div className="mt-1 w-full bg-black/50 h-1.5 rounded-full overflow-hidden border border-green-500/30">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-300 h-full rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          </div>
          <button
            className="ml-auto group flex h-12  items-center justify-center rounded-lg border border-transparent px-3 py-2 hover:border-red-500/30 hover:bg-red-500/10 z-20" // z-indexを追加
            title="ログアウト"
            onClick={handleSignOut}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-black/50 text-red-400 group-hover:text-red-300">
              <LogOut className="size-5" />
            </div>
            <span className="text-red-400">ログアウト</span>
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4">
          {navItems.map((item) => (
            <Link
              href={item.path}
              key={item.id}
              onMouseEnter={() => setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`
                relative overflow-hidden group rounded-lg border border-green-500/30
                transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,128,0.3)]
                ${hoveredCard === item.id ? "border-green-400/70 scale-105 z-10" : "hover:border-green-400/50"}
              `}
            >
              <div className={`bg-gradient-to-br ${item.color} p-4 h-full`}>
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-2">
                    {item.icon}
                    <h2 className="text-xl font-bold text-white">
                      {item.title}
                    </h2>
                  </div>
                  <p className="text-sm text-white/80 mb-4">
                    {item.description}
                  </p>

                  <div className="mt-auto flex justify-end">
                    <div className="bg-black/30 rounded-full p-1">
                      <ChevronRight className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Scan line */}
                <motion.div
                  className="absolute inset-0 bg-white/5 mix-blend-overlay pointer-events-none"
                  animate={{ top: ["100%", "-100%"] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                ></motion.div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-green-500/30 bg-black/50">
          <div className="flex justify-between items-center">
            <div className="text-xs text-green-500/70 font-mono flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tech decorations around the card */}
      <div className="absolute bottom-4 left-4 text-green-500/30 font-mono text-xs">
        <div>SYS:ONLINE</div>
      </div>

      <div className="absolute top-4 right-4 text-green-500/30 font-mono text-xs">
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-green-500 rounded-full"></div>
        </div>
      </div>

      {/* Add global styles for animations */}
      <style jsx global>{`
        @keyframes scrollUp {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        .animate-scrollUp {
          animation: scrollUp 60s linear infinite;
        }
      `}</style>
    </div>
  );
}

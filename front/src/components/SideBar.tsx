"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Home, Swords, LogOut, Coins } from "lucide-react";
import { cn } from "~/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { SlEnergy } from "react-icons/sl";
import { FaLaptopCode, FaRegQuestionCircle } from "react-icons/fa";

type NavItem = {
  title: string;
  icon: React.ReactNode;
  href: string;
  isActive?: boolean;
};

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const [activeItem, setActiveItem] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") {
      setActiveItem("home");
    } else if (pathname === "/rooms") {
      setActiveItem("battle");
    } else if (pathname === "/characters") {
      setActiveItem("characters");
    } else if (pathname === "/gacha") {
      setActiveItem("gacha");
    }
  }, [pathname]);

  const navItems: NavItem[] = [
    {
      title: "ホーム",
      icon: <Home className="size-5" />,
      href: "/",
      isActive: activeItem === "home",
    },
    {
      title: "対戦",
      icon: <Swords className="size-5" />,
      href: "/rooms",
      isActive: activeItem === "battle",
    },
    {
      title: "キャラクター",
      icon: <SlEnergy className="size-5" />,
      href: "/characters",
      isActive: activeItem === "characters",
    },
    {
      title: "ガチャ",
      icon: <FaLaptopCode className="size-5" />,
      href: "/gacha",
      isActive: activeItem === "gacha",
    },
    {
      title: "ポイ活",
      icon: <Coins className="size-5" />,
      href: "/quiz",
      isActive: activeItem === "quiz",
    },
  ];

  return (
    <div
      className={cn(
        "fixed pt-4 flex h-screen w-16 flex-col bg-black/90 border-r border-emerald-900/30 z-1000",
        className,
      )}
    >
      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-2">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li
              key={item.title}
              className="z-20"
              onClick={() => {
                console.log(item);
                router.push(item.href);
              }}
            >
              <a
                href={item.href}
                className={cn(
                  "group relative flex h-12 items-center justify-center rounded-lg border border-transparent px-3 py-2",
                  "hover:border-emerald-500/30 hover:bg-emerald-500/10",
                  item.isActive && "border-emerald-500/50 bg-emerald-500/20",
                )}
                title={item.title}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveItem(
                    item.title === "ホーム"
                      ? "home"
                      : item.title === "対戦"
                        ? "battle"
                        : item.title === "キャラクター"
                          ? "characters"
                          : item.title === "ガチャ"
                            ? "gacha"
                            : item.title === "ポイ活"
                              ? "quiz"
                              : "",
                  );
                }}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md bg-black/50",
                    "text-emerald-400 group-hover:text-emerald-300",
                    item.isActive && "text-emerald-300",
                  )}
                >
                  {item.icon}
                </div>
                <span className="sr-only">{item.title}</span>
                {item.isActive && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500 shadow-[0_0_10px_2px_rgba(16,185,129,0.7)]" />
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-2">
        <button
          className="group flex h-12 w-full items-center justify-center rounded-lg border border-transparent px-3 py-2 hover:border-red-500/30 hover:bg-red-500/10 z-20" // z-indexを追加
          title="ログアウト"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-black/50 text-red-400 group-hover:text-red-300">
            <LogOut className="size-5" />
          </div>
          <span className="sr-only">ログアウト</span>
        </button>
      </div>
    </div>
  );
}

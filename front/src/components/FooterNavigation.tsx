"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
	Home,
	Swords,
	Gamepad2Icon,
	CpuIcon,
	AlignJustifyIcon,
	CrownIcon,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { SlEnergy } from "react-icons/sl";
import { FaLaptopCode } from "react-icons/fa";

type NavItem = {
	title: string;
	icon: React.ReactNode;
	href: string;
	isActive?: boolean;
};

export function FooterNavigation({
	className,
}: React.HTMLAttributes<HTMLDivElement>) {
	const [activeItem, setActiveItem] = useState("");
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (pathname === "/" || pathname === "/home") {
			setActiveItem("home");
		} else if (pathname === "/rooms") {
			setActiveItem("battle");
		} else if (pathname === "/characters") {
			setActiveItem("characters");
		} else if (pathname === "/gacha") {
			setActiveItem("gacha");
		} else if (pathname === "/miniGame") {
			setActiveItem("miniGame");
		} else if (pathname === "/ranking") {
			setActiveItem("ranking");
		} else if (pathname === "/other") {
			setActiveItem("other");
		}
	}, [pathname]);

	console.info("Active Item:", activeItem);

	const navItems: NavItem[] = [
		{
			title: "ホーム",
			icon: <Home className="size-5" />,
			href: "/home",
			isActive: activeItem === "home",
		},
		{
			title: "対戦",
			icon: <Swords className="size-5" />,
			href: "/rooms",
			isActive: activeItem === "battle",
		},
		{
			title: "育成",
			icon: <SlEnergy className="size-5" />,
			href: "/characters",
			isActive: activeItem === "characters",
		},
		{
			title: "ガチャ",
			icon: <CpuIcon className="size-5" />,
			href: "/gacha",
			isActive: activeItem === "gacha",
		},
		{
			title: "ミニゲーム",
			icon: <Gamepad2Icon className="size-5" />,
			href: "/miniGame",
			isActive: activeItem === "miniGame",
		},
		{
			title: "ランキング",
			icon: <CrownIcon className="size-5" />,
			href: "/ranking",
			isActive: activeItem === "ranking",
		},
		{
			title: "その他",
			icon: <AlignJustifyIcon className="size-5" />,
			href: "/other",
			isActive: activeItem === "other",
		},
	];

	if (pathname === "/auth/signIn" || pathname.startsWith("/rooms/")) {
		return null;
	}

	return (
		<nav className={cn("bg-black/90 p-1.5", className)}>
			<ul className="flex justify-around items-center">
				{navItems.map((item) => (
					<li
						key={item.title}
						onClick={() => router.push(item.href)}
						className={cn(
							"flex w-[64px] flex-col items-center text-emerald-400 group hover:text-emerald-300 cursor-pointer p-0.5",
							item.isActive && "bg-green-400/40 rounded-lg",
						)}
						onKeyDown={() => {}}
					>
						<div
							className={cn(
								"flex h-8 w-8 items-center justify-center rounded-md",
							)}
						>
							{item.icon}
						</div>
						<span className="text-xs">{item.title}</span>
					</li>
				))}
			</ul>
		</nav>
	);
}

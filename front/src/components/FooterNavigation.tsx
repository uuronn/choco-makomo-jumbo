"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Home, Swords, Gamepad2Icon } from "lucide-react";
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
		if (pathname === "/") {
			setActiveItem("home");
		} else if (pathname === "/rooms") {
			setActiveItem("battle");
		} else if (pathname === "/characters") {
			setActiveItem("characters");
		} else if (pathname === "/gacha") {
			setActiveItem("gacha");
		} else if (pathname === "/miniGame") {
			setActiveItem("miniGame");
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
			title: "ミニゲーム",
			icon: <Gamepad2Icon className="size-5" />,
			href: "/miniGame",
			isActive: activeItem === "miniGame",
		},
	];

	if (pathname === "/auth/signIn" || pathname.startsWith("/rooms/")) {
		return null;
	}

	return (
		<nav
			className={cn(
				"fixed bottom-0 left-0 right-0 bg-black/90 border-t border-emerald-900/30 z-50",
				className,
			)}
		>
			<ul className="flex justify-around items-center h-14">
				{navItems.map((item) => (
					<li
						key={item.title}
						onClick={() => router.push(item.href)}
						className="flex flex-col items-center text-emerald-400 group hover:text-emerald-300"
						onKeyDown={() => {}}
					>
						<div
							className={cn(
								"flex h-8 w-8 items-center justify-center rounded-md bg-black/50",
								item.isActive && "text-emerald-300",
							)}
						>
							{item.icon}
						</div>
						<span className="text-xs mt-1">{item.title}</span>
					</li>
				))}
			</ul>
		</nav>
	);
}

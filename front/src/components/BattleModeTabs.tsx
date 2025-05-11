"use client";

import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useRouter, usePathname } from "next/navigation";

export default function BattleModeTabs() {
	const router = useRouter();
	const pathname = usePathname();

	const handleTabChange = (value: string) => {
		switch (value) {
			case "1vs1":
				router.push("/rooms");
				break;
			case "cpu":
				router.push("/cpu-battle");
				break;
			case "2vs2":
				router.push("/team-rooms");
				break;
		}
	};

	const getCurrentTab = () => {
		if (pathname?.startsWith("/rooms")) return "1vs1";
		if (pathname?.startsWith("/cpu-battle")) return "cpu";
		if (pathname?.startsWith("/team-rooms")) return "2vs2";
		return "1vs1";
	};

	return (
		<Tabs value={getCurrentTab()} onValueChange={handleTabChange}>
			<TabsList className="grid w-full grid-cols-3">
				<TabsTrigger value="1vs1">対人戦</TabsTrigger>
				<TabsTrigger value="cpu">CPU対戦</TabsTrigger>
				<TabsTrigger value="2vs2">2対2大戦</TabsTrigger>
			</TabsList>
		</Tabs>
	);
}

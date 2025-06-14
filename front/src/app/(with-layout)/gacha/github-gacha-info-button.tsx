"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import GithubGachaInfo from "./github-gacha-info";

export default function GithubGachaInfoButton() {
	const [isInfoOpen, setIsInfoOpen] = useState(false);

	return (
		<>
			<Button
				variant="ghost"
				size="icon"
				className="absolute top-2 left-2 h-8 w-8 rounded-full bg-black/50 border border-green-500/30 text-green-400 hover:bg-green-900/50 hover:text-green-300"
				onClick={() => setIsInfoOpen(true)}
			>
				<HelpCircle className="h-4 w-4" />
				<span className="sr-only">GitHub技術ガチャについて</span>
			</Button>

			<GithubGachaInfo
				isOpen={isInfoOpen}
				onClose={() => setIsInfoOpen(false)}
			/>
		</>
	);
}

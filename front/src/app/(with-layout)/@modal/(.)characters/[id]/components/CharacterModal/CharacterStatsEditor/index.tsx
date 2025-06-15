import { Button } from "~/components/ui/button";
import { StatItem } from "./StatItem";
import {
	BicepsFlexedIcon,
	CrosshairIcon,
	FootprintsIcon,
	GhostIcon,
	HeartIcon,
} from "lucide-react";
import type { Character } from "~/type/character";
import { EditableStatItem } from "./EditableStatItem";

type Props = {
	character: Character;
	handleStatChange: (
		stat: "life" | "power" | "speed",
		increment: boolean,
	) => void;
	statPoints: { life: number; power: number; speed: number };
	remainingPoints: number;
	usedPoints: number;
	handleDevelop: () => void;
};

export const CharacterStatsEditor = ({
	character,
	handleStatChange,
	statPoints,
	remainingPoints,
	usedPoints,
	handleDevelop,
}: Props) => {
	return (
		<div className="flex-1 bg-gray-800/50 rounded-md border border-emerald-500/30 p-3">
			<div className="space-y-2">
				<EditableStatItem
					label="HP"
					icon={<HeartIcon className="h-4 w-4 text-green-300 mr-1" />}
					baseValue={character.life}
					addedPoints={statPoints.life}
					onDecrement={() => handleStatChange("life", false)}
					onIncrement={() => handleStatChange("life", true)}
					canDecrement={statPoints.life > 0}
					canIncrement={remainingPoints > 0}
				/>
				<EditableStatItem
					label="パワー"
					icon={<BicepsFlexedIcon className="h-4 w-4 text-red-300 mr-1" />}
					baseValue={character.power}
					addedPoints={statPoints.power}
					onDecrement={() => handleStatChange("power", false)}
					onIncrement={() => handleStatChange("power", true)}
					canDecrement={statPoints.power > 0}
					canIncrement={remainingPoints > 0}
				/>
				<EditableStatItem
					label="スピード"
					icon={<FootprintsIcon className="h-4 w-4 text-blue-300 mr-1" />}
					baseValue={character.speed}
					addedPoints={statPoints.speed}
					onDecrement={() => handleStatChange("speed", false)}
					onIncrement={() => handleStatChange("speed", true)}
					canDecrement={statPoints.speed > 0}
					canIncrement={remainingPoints > 0}
				/>
				<StatItem
					label="回避率"
					icon={<GhostIcon className="h-4 w-4 text-gray-300 mr-1" />}
					value={`${character.baseEvasion} %`}
				/>
				<StatItem
					label="クリティカル率"
					icon={<CrosshairIcon className="h-4 w-4 text-yellow-300 mr-1" />}
					value={`${character.baseEvasion} %`}
				/>
			</div>

			<Button
				className="mt-4 w-full bg-emerald-500 text-gray-900 hover:bg-green-400 font-bold"
				style={{ boxShadow: "0 0 8px rgba(16, 185, 129, 0.5)" }}
				onClick={handleDevelop}
				disabled={usedPoints === 0}
			>
				育成する
			</Button>
		</div>
	);
};

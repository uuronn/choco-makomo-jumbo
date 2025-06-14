import {
	BookOpenIcon,
	CoinsIcon,
	SwordsIcon,
	TerminalIcon,
	TrophyIcon,
} from "lucide-react";
import { FaLaptopCode } from "react-icons/fa";
import { SlEnergy } from "react-icons/sl";

export const NAV_ITEMS = [
	{
		id: "battle",
		title: "対戦",
		description: "他のプレイヤーと技術力を競え！",
		icon: <SwordsIcon className="h-8 w-8" />,
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
		icon: <CoinsIcon className="h-8 w-8" />,
		color: "from-yellow-500/80 to-amber-500/80",
		path: "/points-activity",
	},
];

export const FOOTER_ITEMS = [
	{
		id: "how-to-play",
		title: "遊び方",
		icon: <BookOpenIcon className="h-5 w-5" />,
		path: "/how-to-play",
	},
	{
		id: "bug-report",
		title: "バグ報告",
		icon: <TerminalIcon className="h-5 w-5" />,
		path: "/bugReportForm",
	},
	{
		id: "ranking",
		title: "ランキング",
		icon: <TrophyIcon className="h-5 w-5" />,
		path: "/ranking",
	},
];

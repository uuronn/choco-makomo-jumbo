import { Database } from "lucide-react";

export const TechPoint = () => {
	return (
		<div className="flex items-center absolute top-4 right-4 bg-gray-900/80 border border-green-400/30 rounded-lg p-2">
			<Database className="h-4 w-4 mr-1 text-emerald-400" />
			<span className="text-green-400 font-semibold">技術ポイント:</span>
			<span className="text-emerald-400 text-xl ml-1">{3000}</span>
		</div>
	);
};

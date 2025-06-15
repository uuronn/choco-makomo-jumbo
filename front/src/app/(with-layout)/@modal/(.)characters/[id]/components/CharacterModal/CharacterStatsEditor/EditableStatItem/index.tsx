"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
	label: string;
	icon: ReactNode;
	baseValue: number;
	addedPoints: number;
	onIncrement: () => void;
	onDecrement: () => void;
	canIncrement: boolean;
	canDecrement: boolean;
};

export const EditableStatItem = ({
	label,
	icon,
	baseValue,
	addedPoints,
	onIncrement,
	onDecrement,
	canIncrement,
	canDecrement,
}: Props) => {
	return (
		<div className="flex items-center justify-between bg-gray-800/80 p-2 rounded-md border border-emerald-500/30">
			<div className="flex items-center whitespace-nowrap text-sm">
				<div className="flex items-center w-36 text-green-200 gap-1">
					{icon}
					{label}：
				</div>
				<div className="text-green-400 font-medium flex items-center gap-1">
					{baseValue}
					{addedPoints > 0 && (
						<span className="text-emerald-400 text-xs">{` (+${addedPoints})`}</span>
					)}
				</div>
			</div>
			<div className="space-x-1">
				<button
					type="button"
					onClick={onDecrement}
					disabled={!canDecrement}
					className="bg-gray-800 p-1 rounded-sm hover:bg-emerald-500 hover:text-gray-900 border border-emerald-500 text-emerald-400 cursor-pointer"
				>
					<MinusIcon className="size-3" />
				</button>
				<button
					type="button"
					onClick={onIncrement}
					disabled={!canIncrement}
					className="bg-gray-800 p-1 rounded-sm hover:bg-emerald-500 hover:text-gray-900 border border-emerald-500 text-emerald-400 cursor-pointer"
				>
					<PlusIcon className="size-3" />
				</button>
			</div>
		</div>
	);
};

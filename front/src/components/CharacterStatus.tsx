import type { ReactNode } from "react";

type Props = {
	label: string;
	icon: ReactNode;
	value: number;
};

export const CharacterStatus = ({ label, icon, value }: Props) => {
	return (
		<div className="flex h-[42px] items-center bg-gray-800/80 p-2 rounded-md border border-emerald-500/30 whitespace-nowrap text-sm">
			<div className="flex items-center w-36 text-green-200 gap-1">
				{icon}
				{label}：
			</div>
			<div className="text-green-400 font-medium">{value}</div>
		</div>
	);
};

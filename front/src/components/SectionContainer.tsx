import type { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
	title: string;
} & ComponentPropsWithoutRef<"section">;

export const SectionContainer = ({ title, className, children }: Props) => {
	return (
		<section
			className={twMerge(
				"w-full bg-gray-900/80 border border-green-400/30 rounded-lg p-3 h-full flex flex-col",
				className,
			)}
		>
			<h2 className="mb-1 text-lg font-bold text-green-400 flex gap-2 items-center">
				{title}
				<div className="h-px flex-grow bg-gradient-to-r from-emerald-400 to-transparent" />
			</h2>

			<div className="overflow-y-scroll h-[140px]">{children}</div>
		</section>
	);
};

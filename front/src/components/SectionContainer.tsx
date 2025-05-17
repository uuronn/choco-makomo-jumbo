import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
	title: string;
	icon: ReactNode;
} & ComponentPropsWithoutRef<"section">;

export const SectionContainer = ({
	title,
	icon,
	className,
	children,
}: Props) => {
	return (
		<section
			className={twMerge(
				"w-full bg-gray-900/80 border border-green-400/30 rounded-lg p-4 overflow-hidden",
				className,
			)}
		>
			<h2 className="mb-4 text-xl font-bold text-green-400 flex gap-2 items-center">
				{icon}
				{title}
				<div className="h-px flex-grow bg-gradient-to-r from-emerald-400 to-transparent" />
			</h2>

			<div className="overflow-y-scroll h-[calc(100%-44px)]">{children}</div>
		</section>
	);
};

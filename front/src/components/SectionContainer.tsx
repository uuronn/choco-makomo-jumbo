import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Props = {
	title: string;
	icon: ReactNode;
} & ComponentPropsWithoutRef<"section">;

export const SectionContainer = ({ title, icon, children }: Props) => {
	return (
		<section className="w-full bg-gray-900/80 border border-green-400/30 rounded-lg p-4">
			<h2 className="mb-4 text-xl font-bold text-green-400 flex gap-2 items-center">
				{icon}
				{title}
				<div className="h-px flex-grow bg-gradient-to-r from-emerald-400 to-transparent" />
			</h2>

			<div className="overflow-y-auto h-[calc(100%-44px)]">{children}</div>
		</section>
	);
};

import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Props = {
	title: string;
	icon: ReactNode;
} & ComponentPropsWithoutRef<"main">;

export const MainContainer = ({ title, icon, children }: Props) => {
	return (
		<div
			className="bg-gray-900 h-[calc(100vh-76px)] p-4"
			style={{
				backgroundImage: `
					radial-gradient(rgba(16, 185, 129, 0.15) 1px, transparent 1px),
					linear-gradient(to right, rgba(16, 185, 129, 0.05) 1px, transparent 1px),
					linear-gradient(to bottom, rgba(16, 185, 129, 0.05) 1px, transparent 1px)
				`,
				backgroundSize: "20px 20px, 20px 20px, 20px 20px, 20px 20px",
			}}
		>
			<div className="container mx-auto p-4 flex flex-col h-[calc(100vh-104px)]">
				<h1 className="gap-3 text-2xl font-bold mb-4 text-green-400 flex items-center">
					{icon}
					{title}
					<div className="h-px flex-grow ml-4 bg-gradient-to-r from-emerald-400 to-transparent" />
				</h1>

				{children}
			</div>
		</div>
	);
};

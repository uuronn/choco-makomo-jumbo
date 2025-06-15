"use client";

import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export const Modal = ({
	children,
}: {
	children: ReactNode;
}) => {
	const router = useRouter();

	return (
		<div
			onKeyDown={() => {}}
			role="button"
			className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
			onClick={() => router.back()}
		>
			<div
				onKeyDown={() => {}}
				role="button"
				onClick={(e) => e.stopPropagation()}
				className="bg-gray-900 text-white rounded-xl shadow-xl p-10 w-full max-w-5xl relative overflow-y-auto"
			>
				<button
					type="button"
					className="absolute top-3 right-3"
					onClick={() => router.back()}
				>
					<XIcon />
				</button>

				{children}
			</div>
		</div>
	);
};

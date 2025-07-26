"use client";

import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export const Modal = ({ children }: { children: ReactNode }) => {
	const router = useRouter();

	return (
		<div
			onKeyDown={() => {}}
			role="button"
			className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-start flex-col"
			onClick={() => router.back()}
		>
			<div
				onKeyDown={() => {}}
				role="button"
				onClick={(e) => e.stopPropagation()}
				className="bg-gray-900 text-white rounded-xl shadow-xl p-4 w-full max-w-5xl relative text-sm sm:text-base h-[74vh]"
			>
				<button
					type="button"
					className="absolute top-[-8px] right-[-8px] cursor-pointer bg-gray-600 rounded-full p-1"
					onClick={() => router.back()}
				>
					<XIcon className="h-4 w-4 sm:h-5 sm:w-5" />
				</button>

				{children}
			</div>
		</div>
	);
};

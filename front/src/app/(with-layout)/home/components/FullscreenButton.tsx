"use client";

import { useCallback } from "react";

export default function FullscreenButton() {
	const handleClick = useCallback(() => {
		const el = document.documentElement;

		if (el.requestFullscreen) {
			el.requestFullscreen();
		} else if ("webkitRequestFullscreen" in el) {
			(
				el as HTMLElement & {
					webkitRequestFullscreen: () => Promise<void>;
				}
			).webkitRequestFullscreen();
		} else if ("mozRequestFullScreen" in el) {
			(
				el as HTMLElement & {
					mozRequestFullScreen: () => Promise<void>;
				}
			).mozRequestFullScreen();
		} else if ("msRequestFullscreen" in el) {
			(
				el as HTMLElement & {
					msRequestFullscreen: () => Promise<void>;
				}
			).msRequestFullscreen();
		} else {
			alert("このブラウザはフルスクリーンに対応していません");
		}
	}, []);

	return (
		<button
			type="button"
			onClick={handleClick}
			className="bg-black text-white rounded text-sm"
		>
			フルスクリーン
		</button>
	);
}

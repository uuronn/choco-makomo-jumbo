"use client";

import { useEffect, useState, useRef } from "react";
import { SnackbarProvider } from "notistack";
import { FooterNavigation } from "~/components/FooterNavigation";

export function ClientLayout({ children }: { children: React.ReactNode }) {
	const [innerHeight, setInnerHeight] = useState<number | null>(null);
	const [screenHeight, setScreenHeight] = useState<number | null>(null);

	const layoutRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setInnerHeight(window.innerHeight);
		// 横画面のため、横幅を高さに置き換える
		setScreenHeight(window.screen.width);
	}, []);

	useEffect(() => {
		if (layoutRef.current && screenHeight && innerHeight) {
			const calcHeight = screenHeight - innerHeight - 64;

			layoutRef.current.style.height = `${calcHeight}px`;
		}
	}, [screenHeight, innerHeight]);

	return (
		<SnackbarProvider
			anchorOrigin={{ vertical: "top", horizontal: "right" }}
			maxSnack={3}
		>
			{/* <p>{innerHeight !== null ? `${innerHeight}px` : "読み込み中..."}</p>
			<p>{screenHeight !== null ? `${screenHeight}px` : "読み込み中..."}</p> */}

			{/* Layout container */}
			{/* Using ref to potentially manipulate layout later if needed */}
			<div ref={layoutRef} className="flex flex-col">
				<div className="h-full flex justify-center">{children}</div>
				<FooterNavigation />
			</div>
		</SnackbarProvider>
	);
}

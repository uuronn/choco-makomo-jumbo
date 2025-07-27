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
		setScreenHeight(window.screen.height);
	}, []);

	return (
		<SnackbarProvider
			anchorOrigin={{ vertical: "top", horizontal: "right" }}
			maxSnack={3}
		>
			<p>{innerHeight !== null ? `${innerHeight}px` : "読み込み中..."}</p>
			<p>{screenHeight !== null ? `${screenHeight}px` : "読み込み中..."}</p>

			{/* Layout container */}
			{/* Using ref to potentially manipulate layout later if needed */}
			<div ref={layoutRef} className="flex flex-col h-screen">
				<div className="h-full flex justify-center">{children}</div>
				<FooterNavigation />
			</div>
		</SnackbarProvider>
	);
}

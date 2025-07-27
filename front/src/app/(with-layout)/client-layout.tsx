"use client";

import { useEffect, useState, useRef } from "react";
import { SnackbarProvider } from "notistack";
import { FooterNavigation } from "~/components/FooterNavigation";

export function ClientLayout({ children }: { children: React.ReactNode }) {
	const [innerHeight, setInnerHeight] = useState<number | null>(null);
	const layoutRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setInnerHeight(window.innerHeight);
	}, []);

	return (
		<SnackbarProvider
			anchorOrigin={{ vertical: "top", horizontal: "right" }}
			maxSnack={3}
		>
			<p>{innerHeight !== null ? `${innerHeight}px` : "読み込み中..."}</p>
			<div ref={layoutRef} className="flex flex-col h-screen">
				<div className="h-full flex justify-center">{children}</div>
				<FooterNavigation />
			</div>
		</SnackbarProvider>
	);
}

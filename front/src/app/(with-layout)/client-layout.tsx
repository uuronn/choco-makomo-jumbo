"use client";

import { useEffect, useRef } from "react";
import { SnackbarProvider } from "notistack";
import { FooterNavigation } from "~/components/FooterNavigation";
import { MatrixRainCanvas } from "../_components/MatrixRainCanvas";

export function ClientLayout({ children }: { children: React.ReactNode }) {
	const layoutRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const width = layoutRef.current?.clientWidth;
		console.log("Layout width:", width);
	}, []);

	return (
		<SnackbarProvider
			anchorOrigin={{ vertical: "top", horizontal: "right" }}
			maxSnack={3}
		>
			<MatrixRainCanvas />
			<div ref={layoutRef} className="relative z-10">
				<p>{layoutRef.current?.clientWidth}</p>
				<p>{layoutRef.current?.clientHeight}</p>
				{children}
			</div>
			<FooterNavigation />
		</SnackbarProvider>
	);
}

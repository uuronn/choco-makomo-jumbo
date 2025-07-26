"use client";

import { useEffect, useRef, useState } from "react";
import { SnackbarProvider } from "notistack";
import { FooterNavigation } from "~/components/FooterNavigation";
import { MatrixRainCanvas } from "../_components/MatrixRainCanvas";

export function ClientLayout({ children }: { children: React.ReactNode }) {
	const layoutRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	useEffect(() => {
		if (!layoutRef.current) return;
		const resize = () => {
			setDimensions({
				width: layoutRef.current!.clientWidth,
				height: layoutRef.current!.clientHeight,
			});
		};

		resize(); // 初期取得
		window.addEventListener("resize", resize); // リサイズ時にも反映
		return () => window.removeEventListener("resize", resize);
	}, []);

	return (
		<div ref={layoutRef} className="bg-red-200 min-h-screen">
			<div className="bg-red-200 p-4">
				<p>Width: {dimensions.width}px</p>
				<p>Height: {dimensions.height}px</p>
			</div>
			<SnackbarProvider
				anchorOrigin={{ vertical: "top", horizontal: "right" }}
				maxSnack={3}
			>
				{/* <MatrixRainCanvas /> */}
				{/* <div className="relative z-10">{children}</div> */}
				<FooterNavigation />
			</SnackbarProvider>
		</div>
	);
}

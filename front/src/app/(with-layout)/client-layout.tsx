"use client";

import { useRef } from "react";
import { SnackbarProvider } from "notistack";
import { FooterNavigation } from "~/components/FooterNavigation";
// import { MatrixRainCanvas } from "../_components/MatrixRainCanvas";

export function ClientLayout({ children }: { children: React.ReactNode }) {
	const layoutRef = useRef<HTMLDivElement>(null);
	// const [dimensions, setDimensions] = useState<{
	// 	width: number;
	// 	height: number;
	// }>({ width: 0, height: 0 });

	// useEffect(() => {
	// 	if (!layoutRef.current) return;

	// 	const resize = () => {
	// 		setDimensions({
	// 			width: layoutRef.current?.clientWidth || 0,
	// 			height: layoutRef.current?.clientHeight || 0,
	// 		});
	// 	};

	// 	resize(); // 初期取得
	// 	window.addEventListener("resize", resize); // リサイズ時にも反映
	// 	return () => window.removeEventListener("resize", resize);
	// }, []);

	return (
		// <div ref={layoutRef} className="bg-red-200 min-h-screen">
		// 	{/* SP版でこれが出現する */}
		// 	<div className="h-[40px] bg-red-600">test</div>
		// 	<div className="bg-red-200 p-4">
		// 		<p>Width: {dimensions.width}px</p>
		// 		<p>Height: {dimensions.height}px</p>
		// 	</div>
		<SnackbarProvider
			anchorOrigin={{ vertical: "top", horizontal: "right" }}
			maxSnack={3}
		>
			<div className="flex flex-col h-screen">
				{/* <MatrixRainCanvas /> */}
				{/* <div className="relative z-10">{children}</div> */}
				<div className="h-full flex justify-center">{children}</div>
				<FooterNavigation />
			</div>
		</SnackbarProvider>
		// </div>
	);
}

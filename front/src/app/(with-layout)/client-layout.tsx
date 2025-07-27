"use client";

import { useEffect, useState, useRef } from "react";
import { SnackbarProvider } from "notistack";
import { FooterNavigation } from "~/components/FooterNavigation";
import { MatrixRainCanvas } from "../_components/MatrixRainCanvas";

export function ClientLayout({ children }: { children: React.ReactNode }) {
	const [innerHeight, setInnerHeight] = useState<number | null>(null);
	const [screenHeight, setScreenHeight] = useState<number | null | undefined>(
		null,
	);

	const layoutRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setInnerHeight(window.innerHeight);
		// 横画面のため、横幅を高さに置き換える
		setScreenHeight(window.visualViewport?.height);
	}, []);

	useEffect(() => {
		if (layoutRef.current && screenHeight && innerHeight) {
			// 高さを計算して設定
			// 画面の高さからinnerHeightとフッターメニューの高さを引いて計算
			// フッターメニューの高さは64px
			const calcHeight = screenHeight - innerHeight;

			const height = screenHeight - calcHeight;

			console.info("Inner Height:", innerHeight);
			console.info("Screen Height:", screenHeight);
			console.info("Calculated Height:", calcHeight);
			console.info("Layout Height:", height);
			layoutRef.current.style.height = `${height}px`;
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
			{/* <div ref={layoutRef} className="flex flex-col"> */}
			<div ref={layoutRef} className="flex-col flex justify-center">
				<MatrixRainCanvas />
				<div className="w-full h-full p-4">
					{/* clacを使ってh-fullにpを引く */}
					{children}

					{/* <div className="m-auto p-4 h-full w-full">{children}</div> */}
				</div>

				<FooterNavigation />
			</div>
			{/* </div> */}
		</SnackbarProvider>
	);
}

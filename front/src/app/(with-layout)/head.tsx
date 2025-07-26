// app/(with-layout)/home/head.tsx
export default function Head() {
	console.log("Headコンポーネントが呼び出されました");
	return (
		<>
			{/* アイコンの指定（必須） */}
			<link rel="apple-touch-icon" href="/icons/icon-192.png" />

			{/* マニフェストの指定（必須） */}
			<link rel="manifest" href="/manifest.json" />

			{/* 任意でfaviconも */}
			<link rel="icon" href="/favicon.ico" />
		</>
	);
}

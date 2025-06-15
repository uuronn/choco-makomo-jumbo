export const GameList = () => {
	return (
		<div className="flex flex-col items-center justify-center h-full p-4">
			<h1 className="text-2xl font-bold mb-4">ミニゲーム一覧</h1>
			<p className="text-gray-600 mb-8">
				ここでは、様々なミニゲームをプレイできます。お楽しみください！
			</p>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
				{/* ミニゲームのカードをここに追加 */}
			</div>
		</div>
	);
};

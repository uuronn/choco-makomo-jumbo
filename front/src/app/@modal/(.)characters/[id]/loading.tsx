export default function Loading() {
	return (
		<div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
			<div className="text-white text-lg animate-pulse">
				キャラクターを読み込み中...
			</div>
		</div>
	);
}

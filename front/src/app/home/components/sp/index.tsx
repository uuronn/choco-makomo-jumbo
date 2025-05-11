export default function SpHomePage({
	user,
}: { user: { uid: string; name?: string } }) {
	return (
		<div className="p-4 text-center">
			📱 モバイル版です！こんにちは、{user.name ?? user.uid} さん！
		</div>
	);
}

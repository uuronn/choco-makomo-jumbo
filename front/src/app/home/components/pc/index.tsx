export default function DesktopHome({
	user,
}: { user: { uid: string; name?: string } }) {
	console.info("user", user);
	return (
		<div className="p-10 text-left">
			💻 デスクトップ版へようこそ！{user.name ?? user.uid} さん！
		</div>
	);
}

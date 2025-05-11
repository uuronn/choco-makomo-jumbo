export default function PcHomePage({
	user,
}: { user: { uid: string; name?: string } }) {
	return (
		<div className="p-10 text-left">
			💻 デスクトップ版へようこそ！{user.name ?? user.uid} さん！
		</div>
	);
}

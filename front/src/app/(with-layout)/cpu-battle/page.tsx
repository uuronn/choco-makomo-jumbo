export default async function CpuBattlePage() {
	const cookieStore = await cookies();
	const token = getTokenFromCookies(cookieStore);
	const user = await fetchUserFromToken(token);

	if (!user) {
		return <div className="p-4">ユーザー情報の取得に失敗しました</div>;
	}

	return (
		<div className="min-h-screen bg-gray-900 flex flex-col items-center p-4">
			<div className="w-full max-w-4xl">
				<BattleModeTabs />
				<div className="mt-8">
					<Suspense fallback={<div>読み込み中...</div>}>
						<CpuBattleClient initialToken={token} />
					</Suspense>
				</div>
			</div>
		</div>
	);
}

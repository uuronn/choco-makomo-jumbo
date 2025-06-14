import { cookies } from "next/headers";
import { Suspense } from "react";
import { getTokenFromCookies } from "~/utils/token";
import { fetchUserFromToken } from "~/lib/user";
import { TeamsClient } from "./TeamsClient";

export default async function TeamsPage() {
	const cookieStore = await cookies();
	const token = getTokenFromCookies(cookieStore);
	const user = await fetchUserFromToken(token);

	if (!user) {
		return <div className="p-4">ユーザー情報の取得に失敗しました</div>;
	}

	return (
		<div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 overflow-hidden">
			<Suspense fallback={<div>読み込み中...</div>}>
				<TeamsClient initialToken={token} />
			</Suspense>
		</div>
	);
}

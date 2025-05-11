import { cookies } from "next/headers";
import { Suspense } from "react";
import { getTokenFromCookies } from "~/utils/token";
import { fetchUserFromToken } from "~/lib/user";
import { GachaClient } from "./GachaClient";
import { getDeviceFromCookies } from "~/utils/device";

export default async function GachaPage() {
	const cookieStore = await cookies();
	const token = getTokenFromCookies(cookieStore);
	const device = getDeviceFromCookies(cookieStore);
	const user = await fetchUserFromToken(token);

	if (!user) {
		return <div className="p-4">ユーザー情報の取得に失敗しました</div>;
	}

	return (
		<div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 overflow-hidden">
			ｆｄｆｄｄｆ{" "}
			<Suspense fallback={<div>読み込み中...</div>}>
				<GachaClient initialToken={token} />
			</Suspense>
		</div>
	);
}

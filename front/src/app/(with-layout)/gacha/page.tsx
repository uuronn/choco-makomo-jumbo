import { cookies } from "next/headers";
import { Suspense } from "react";
import { getTokenFromCookies } from "~/utils/token";
import { fetchUserFromToken } from "~/lib/user";
import { GachaClient } from "./GachaClient";
import { getDeviceFromCookies } from "~/utils/device";
import { MainContainer } from "~/components/MainContainer";
import { ZapIcon } from "lucide-react";
import { TechPoint } from "~/components/TechPoint";

export default async function GachaPage() {
	const cookieStore = await cookies();
	const token = getTokenFromCookies(cookieStore);
	const device = getDeviceFromCookies(cookieStore);
	const user = await fetchUserFromToken(token);

	if (!user) {
		return <div className="p-4">ユーザー情報の取得に失敗しました</div>;
	}

	return (
		<MainContainer title="技術ガチャ" icon={<ZapIcon />}>
			<TechPoint />
			<GachaClient initialToken={token} />
		</MainContainer>
	);
}

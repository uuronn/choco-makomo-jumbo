import { cookies } from "next/headers";
import { getDeviceFromCookies } from "~/utils/device";
import { getTokenFromCookies } from "~/utils/token";
import { fetchUserFromToken } from "~/lib/user";
import SpHomeScreen from './components/sp';
import PcHomeScreen from './components/pc';

export default async function HomePage() {
	const cookieStore = await cookies();
	const token = getTokenFromCookies(cookieStore);
	const device = getDeviceFromCookies(cookieStore);

	const user = await fetchUserFromToken(token);

	if (!user) {
		return <div className="p-4">ユーザー情報の取得に失敗しました</div>;
	}

	if (device === "mobile") {
		return <SpHomeScreen user={user} />;
	}

	return <PcHomeScreen user={user} />;
}

import { cookies } from "next/headers";
import PcHomePage from "./components/pc";
import SpHomePage from "./components/sp";
import { getDeviceFromCookies } from "~/utils/device";
import { getTokenFromCookies } from "~/utils/token";
import { fetchUserFromToken } from "~/lib/user";

export default async function HomePage() {
	const cookieStore = await cookies();
	const token = getTokenFromCookies(cookieStore);
	const device = getDeviceFromCookies(cookieStore);

	const user = await fetchUserFromToken(token);

	if (!user) {
		return <div className="p-4">ユーザー情報の取得に失敗しました</div>;
	}

	if (device === "mobile") {
		return <SpHomePage user={user} />;
	}

	return <PcHomePage user={user} />;
}

import { cookies } from "next/headers";
import { fetchOnlineUserCount } from "~/lib/onlineUserCount";
import { getTokenFromCookies } from "~/utils/token";

export const OnlineUserCounter = async () => {
	const cookieStore = await cookies();
	const token = getTokenFromCookies(cookieStore);

	const onlineUserCount = await fetchOnlineUserCount(token);

	return <span>ONLINE: {onlineUserCount}</span>;
};

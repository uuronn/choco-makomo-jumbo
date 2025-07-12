import { cookies } from "next/headers";
import RoomDetailClient from "./_components/RoomDetailClient";
import { getTokenFromCookies } from "~/utils/token";
import { fetchUserFromToken } from "~/lib/user";

export default async function RoomDetailPage() {
	const cookieStore = await cookies();
	const token = getTokenFromCookies(cookieStore);
	const user = await fetchUserFromToken(token);

	<div>{user.id}</div>;

	// return <RoomDetailClient user={user} />;
}

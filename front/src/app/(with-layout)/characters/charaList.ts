"use server";

import { cookies } from "next/headers";
import { fetchUserFromToken } from "~/lib/user";
import { getTokenFromCookies } from "~/utils/token";

export const getCharaList = async () => {
	const cookieStore = await cookies();
	const token = getTokenFromCookies(cookieStore);

	const user = await fetchUserFromToken(token);

	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${user.id}/characters`,
		{
			headers: { Authorization: `Bearer ${token}` },
		},
	);

	if (!res.ok) {
		throw new Error("キャラクター一覧の取得に失敗しました");
	}

	return res.json();
};

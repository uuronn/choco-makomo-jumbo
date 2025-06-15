"use server";

import { cookies } from "next/headers";
import { fetchUserFromToken } from "~/lib/user";
import { getTokenFromCookies } from "~/utils/token";

export const fetchCharacterById = async (characterId: string) => {
	const cookieStore = await cookies();
	const token = getTokenFromCookies(cookieStore);

	const user = await fetchUserFromToken(token);

	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${user.id}/characters/${characterId}`,
		{
			headers: { Authorization: `Bearer ${token}` },
		},
	);

	if (!res.ok) {
		throw new Error("キャラクターの取得に失敗しました");
	}

	return res.json();
};

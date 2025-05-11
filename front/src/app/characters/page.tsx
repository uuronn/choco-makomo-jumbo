import { cookies } from "next/headers";
import { Suspense } from "react";
import { getTokenFromCookies } from "~/utils/token";
import { fetchUserFromToken } from "~/lib/user";
import { CharacterClient } from "./CharacterClient";

export default async function CharactersPage() {
	const cookieStore = await cookies();
	const token = getTokenFromCookies(cookieStore);
	const user = await fetchUserFromToken(token);

	if (!user) {
		return <div className="p-4">ユーザー情報の取得に失敗しました</div>;
	}

	return (
		<Suspense fallback={<div>読み込み中...</div>}>
			<CharacterClient initialToken={token} />
		</Suspense>
	);
}

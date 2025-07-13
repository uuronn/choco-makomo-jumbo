import { cookies } from "next/headers";
import { CharacterModal } from "./components/CharacterModal";
import { fetchCharacterById } from "./functions/fetchCharacterById";
import { getTokenFromCookies } from "~/utils/token";
import { fetchUserFromToken } from "~/lib/user";

export default async function CharacterModalPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const character = await fetchCharacterById(id);
	const cookieStore = await cookies();
	const token = getTokenFromCookies(cookieStore);
	const user = await fetchUserFromToken(token);

	if (!user) {
		return <div className="p-4">ユーザー情報の取得に失敗しました</div>;
	}

	return (
		<CharacterModal character={character} userId={user.id} token={token} />
	);
}

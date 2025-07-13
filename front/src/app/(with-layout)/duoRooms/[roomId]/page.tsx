import { cookies } from "next/headers";
import { getTokenFromCookies } from "~/utils/token";
import { fetchUserFromToken } from "~/lib/user";
import DuoRoomCharacterSelectionClient from "./_components/RoomDetailClient";
import { getCharaList } from "../../characters/charaList";
import type { Character } from "~/type/character";

export default async function RoomDetailPage() {
	const cookieStore = await cookies();
	const token = getTokenFromCookies(cookieStore);
	const user = await fetchUserFromToken(token);

	const userCharacterList: Character[] = await getCharaList();

	// <div>{user.id}</div>;

	return (
		<DuoRoomCharacterSelectionClient
			userId={user.id}
			availableCharacters={userCharacterList}
		/>
	);
}

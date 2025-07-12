import { cookies } from "next/headers";
import { getTokenFromCookies } from "~/utils/token";
import { fetchUserFromToken } from "~/lib/user";
import { MainContainer } from "~/components/MainContainer";
import { SwordsIcon } from "lucide-react";
import { SectionContainer } from "~/components/SectionContainer";
import { SelectCharacterContainer } from "./_components/SelectCharacterContainer";
import { DuoRoomListSectionContainerContent } from "./_components/DuoRoomListSectionContainerContent";

export default async function DuoRoomsPage() {
	const cookieStore = await cookies();
	const token = getTokenFromCookies(cookieStore);
	const user = await fetchUserFromToken(token);

	if (!user) {
		return <div className="p-4">ユーザー情報の取得に失敗しました</div>;
	}

	return (
		<MainContainer title="デュオ対戦" icon={<SwordsIcon size={40} />}>
			{/* <SelectCharacterContainer /> */}

			<SectionContainer title="ルーム一覧">
				<DuoRoomListSectionContainerContent token={token} user={user} />
			</SectionContainer>
		</MainContainer>
	);
}

import { cookies } from "next/headers";
import { getTokenFromCookies } from "~/utils/token";
import { fetchUserFromToken } from "~/lib/user";
import { MainContainer } from "~/components/MainContainer";
import { SwordsIcon } from "lucide-react";
import { SectionContainer } from "~/components/SectionContainer";
import { SelectCharacterContainer } from "./_components/SelectCharacterContainer";

export default async function RoomsPage() {
	const cookieStore = await cookies();
	const token = getTokenFromCookies(cookieStore);
	const user = await fetchUserFromToken(token);

	if (!user) {
		return <div className="p-4">ユーザー情報の取得に失敗しました</div>;
	}

	return (
		<MainContainer title="対戦" icon={<SwordsIcon size={40} />}>
			<SelectCharacterContainer />

			<SectionContainer title="ルーム一覧">test</SectionContainer>
		</MainContainer>
	);
}

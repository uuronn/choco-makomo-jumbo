import { cookies } from "next/headers";
import { getTokenFromCookies } from "~/utils/token";
import { fetchUserFromToken } from "~/lib/user";
import { RoomsClient } from "./RoomsClient";
import { MainContainer } from "~/components/MainContainer";
import { SwordsIcon } from "lucide-react";

export default async function RoomsPage() {
	const cookieStore = await cookies();
	const token = getTokenFromCookies(cookieStore);
	const user = await fetchUserFromToken(token);

	if (!user) {
		return <div className="p-4">ユーザー情報の取得に失敗しました</div>;
	}

	return (
		<MainContainer title="対戦" icon={<SwordsIcon size={40} />}>
			<RoomsClient initialToken={token} />
		</MainContainer>
	);
}

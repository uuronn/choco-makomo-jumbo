import { cookies } from "next/headers";
import { getTokenFromCookies } from "~/utils/token";
import { fetchUserFromToken } from "~/lib/user";
import { MainContainer } from "~/components/MainContainer";
import { Gamepad2Icon } from "lucide-react";
import { TechPoint } from "~/components/TechPoint";
import { SectionContainer } from "~/components/SectionContainer";
import { GameList } from "./components/GameList";

export default async function MiniGamePage() {
	const cookieStore = await cookies();
	const token = getTokenFromCookies(cookieStore);
	const user = await fetchUserFromToken(token);

	if (!user) {
		return <div className="p-4">ユーザー情報の取得に失敗しました</div>;
	}

	return (
		<MainContainer title="ミニゲーム" icon={<Gamepad2Icon size={40} />}>
			<TechPoint />

			<SectionContainer title="ミニゲーム一覧" className="h-full">
				<GameList />
			</SectionContainer>
		</MainContainer>
	);
}

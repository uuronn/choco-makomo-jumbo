import { cookies } from "next/headers";
import { getTokenFromCookies } from "~/utils/token";
import { fetchUserFromToken } from "~/lib/user";
import { TechPoint } from "~/components/TechPoint";
import { ZapIcon } from "lucide-react";
import { MainContainer } from "~/components/MainContainer";
import { SectionContainer } from "~/components/SectionContainer";
import CharacterList from "./components/CharacterList";

export default async function CharactersPage() {
	const cookieStore = await cookies();
	const token = getTokenFromCookies(cookieStore);
	const user = await fetchUserFromToken(token);

	if (!user) {
		return <div className="p-4">ユーザー情報の取得に失敗しました</div>;
	}

	return (
		<MainContainer title="技術育成" icon={<ZapIcon size={40} />}>
			<TechPoint />

			<SectionContainer title="所持技術">
				<CharacterList />
			</SectionContainer>
		</MainContainer>
	);
}

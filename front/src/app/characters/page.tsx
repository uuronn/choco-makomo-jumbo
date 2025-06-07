import { cookies } from "next/headers";
import { Suspense } from "react";
import { getTokenFromCookies } from "~/utils/token";
import { fetchUserFromToken } from "~/lib/user";
import { CharacterClient } from "./CharacterClient";
import { TechPoint } from "~/components/TechPoint";
import { CpuIcon, ZapIcon } from "lucide-react";
import { MainContainer } from "~/components/MainContainer";
import { SectionContainer } from "~/components/SectionContainer";
import CharacterList from "./components/CharacterList";
import { getCharaList } from "./charaList";

export default async function CharactersPage() {
	const cookieStore = await cookies();
	const token = getTokenFromCookies(cookieStore);
	const user = await fetchUserFromToken(token);

	if (!user) {
		return <div className="p-4">ユーザー情報の取得に失敗しました</div>;
	}

	const userCharacterList = await getCharaList();

	console.info("userCharacterList", userCharacterList);

	return (
		<MainContainer title="技術育成" icon={<ZapIcon size={40} />}>
			<TechPoint />

			<SectionContainer title="所持技術" icon={<CpuIcon />} className="h-full">
				<CharacterList userCharacterList={userCharacterList} />
			</SectionContainer>
		</MainContainer>
	);
}

import { cookies } from "next/headers";
import { getTokenFromCookies } from "~/utils/token";
import { fetchUserFromToken } from "~/lib/user";
import { MainContainer } from "~/components/MainContainer";
import { Gamepad2Icon } from "lucide-react";
import { SectionContainer } from "~/components/SectionContainer";
import FullscreenButton from "../home/components/FullscreenButton";

export default async function OtherPage() {
	const cookieStore = await cookies();
	const token = getTokenFromCookies(cookieStore);
	const user = await fetchUserFromToken(token);

	if (!user) {
		return <div className="p-4">ユーザー情報の取得に失敗しました</div>;
	}

	return (
		<MainContainer title="その他" icon={<Gamepad2Icon size={40} />}>
			{/* <TechPoint /> */}

			<SectionContainer title="その他一覧" className="h-full">
				<FullscreenButton />
				{/* <GameList /> */}
			</SectionContainer>
		</MainContainer>
	);
}

import { cookies } from "next/headers";
import { getTokenFromCookies } from "~/utils/token";
import { fetchUserFromToken } from "~/lib/user";
import { GachaClient } from "./GachaClient";
import { MainContainer } from "~/components/MainContainer";
import { CpuIcon } from "lucide-react";
import { TechPoint } from "~/components/TechPoint";
import { SectionContainer } from "~/components/SectionContainer";

export default async function GachaPage() {
	const cookieStore = await cookies();
	const token = getTokenFromCookies(cookieStore);
	const user = await fetchUserFromToken(token);

	if (!user) {
		return <div className="p-4">ユーザー情報の取得に失敗しました</div>;
	}

	return (
		<MainContainer title="ガチャ" icon={<CpuIcon size={40} />}>
			<TechPoint />

			{/* <div className="flex h-full"> */}
			<SectionContainer title="ガチャ一覧">
				<GachaClient initialToken={token} />
			</SectionContainer>
			{/* <SectionContainer title="GitHubガチャ">
					<GachaClient initialToken={token} />
				</SectionContainer>
			</div> */}
		</MainContainer>
	);
}

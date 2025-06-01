import { cookies } from "next/headers";
import { Suspense } from "react";
import { getTokenFromCookies } from "~/utils/token";
import { fetchUserFromToken } from "~/lib/user";
import { RoomsClient } from "./RoomsClient";
import BattleModeTabs from "~/components/BattleModeTabs";
import { MainContainer } from "~/components/MainContainer";
import { BatteryFullIcon } from "lucide-react";

export default async function RoomsPage() {
	const cookieStore = await cookies();
	const token = getTokenFromCookies(cookieStore);
	const user = await fetchUserFromToken(token);

	if (!user) {
		return <div className="p-4">ユーザー情報の取得に失敗しました</div>;
	}

	return (
		<MainContainer title="バトル" icon={<BatteryFullIcon />}>
			<div className="min-h-screen bg-gray-900 flex flex-col items-center p-4">
				<div className="w-full max-w-4xl">
					{/* <BattleModeTabs /> */}
					<div>
						<Suspense fallback={<div>読み込み中...</div>}>
							<RoomsClient initialToken={token} />
						</Suspense>
					</div>
				</div>
			</div>
		</MainContainer>
	);
}

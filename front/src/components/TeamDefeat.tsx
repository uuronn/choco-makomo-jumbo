import { Button } from "./ui/button";
import type { TeamRoom } from "~/type/team";
import { useRouter } from "next/navigation";

type TeamDefeatProps = {
	room: TeamRoom;
};

export default function TeamDefeat({ room }: TeamDefeatProps) {
	const router = useRouter();

	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<h1 className="text-4xl font-bold text-red-400 mb-8">敗北...</h1>
			<Button
				onClick={() => router.push("/team-rooms")}
				className="bg-green-400 text-black hover:bg-green-500"
			>
				ルーム一覧に戻る
			</Button>
		</div>
	);
}

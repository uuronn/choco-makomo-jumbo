import { Button } from "./ui/button";
import type { TeamRoom } from "~/type/team";
import { useRouter } from "next/navigation";

type TeamVictoryProps = {
	room: TeamRoom;
};

export default function TeamVictory({ room }: TeamVictoryProps) {
	const router = useRouter();

	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<h1 className="text-4xl font-bold text-green-400 mb-8">勝利！</h1>
			<Button
				onClick={() => router.push("/team-rooms")}
				className="bg-green-400 text-black hover:bg-green-500"
			>
				ルーム一覧に戻る
			</Button>
		</div>
	);
}

import { Button } from "./ui/button";
import type { TeamRoom } from "~/type/team";
import { useUserContext } from "~/context/UserProvider";
import { enqueueSnackbar } from "notistack";
import Image from "next/image";
import { characterToImagePath } from "~/lib/utils";

type TeamPendingProps = {
	room: TeamRoom;
	setRoom: (room: TeamRoom) => void;
};

export default function TeamPending({ room, setRoom }: TeamPendingProps) {
	const { user } = useUserContext();

	const handleApprove = async () => {
		if (!user) return;
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/team-rooms/${room.id}/approve`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ userId: user.uid }),
				},
			);
			const data = await res.json();
			if (res.ok) {
				setRoom(data);
			} else {
				enqueueSnackbar(data.message, { variant: "error" });
			}
		} catch (e) {
			enqueueSnackbar("承認に失敗しました", { variant: "error" });
		}
	};

	return (
		<div className="container mx-auto p-4">
			<h2 className="text-xl font-bold text-green-400 mb-8">対戦承認</h2>

			{/* チーム1（自分のチーム） */}
			<div className="mb-8">
				<h3 className="text-lg font-bold text-green-400 mb-4">自分のチーム</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{room.team1.characters.map((char) => (
						<div
							key={char.characterId}
							className="p-4 rounded-lg border border-green-400/30"
						>
							<div className="relative w-16 h-16 mx-auto mb-2">
								<Image
									src={
										characterToImagePath(char.characterId) || "/placeholder.svg"
									}
									alt={char.character.name}
									fill
									className="object-cover rounded-lg"
								/>
							</div>
							<p className="text-center text-green-400">
								{char.character.name}
							</p>
						</div>
					))}
				</div>
			</div>

			{/* チーム2（相手のチーム） */}
			<div className="mb-8">
				<h3 className="text-lg font-bold text-green-400 mb-4">相手のチーム</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{room.team2?.characters.map((char) => (
						<div
							key={char.characterId}
							className="p-4 rounded-lg border border-green-400/30"
						>
							<div className="relative w-16 h-16 mx-auto mb-2">
								<Image
									src={
										characterToImagePath(char.characterId) || "/placeholder.svg"
									}
									alt={char.character.name}
									fill
									className="object-cover rounded-lg"
								/>
							</div>
							<p className="text-center text-green-400">
								{char.character.name}
							</p>
						</div>
					))}
				</div>
			</div>

			<div className="text-center">
				<Button
					onClick={handleApprove}
					className="bg-green-400 text-black hover:bg-green-500"
				>
					対戦を承認
				</Button>
			</div>
		</div>
	);
}

import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { useUserContext } from "~/context/UserProvider";
import type { TeamRoom } from "~/type/team";

type TeamCreateLoadingProps = {
	message: string;
	room: TeamRoom;
};

export default function TeamCreateLoading({
	message,
	room,
}: TeamCreateLoadingProps) {
	const router = useRouter();
	const { user } = useUserContext();

	const handleCancel = async () => {
		if (!user) return;
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/team-rooms/${room.id}/cancel`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ userId: user.uid }),
				},
			);
			if (res.ok) {
				router.push("/team-rooms");
			} else {
				const data = await res.json();
				enqueueSnackbar(data.message, { variant: "error" });
			}
		} catch (e) {
			enqueueSnackbar("キャンセルに失敗しました", { variant: "error" });
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<Loader2 className="h-8 w-8 animate-spin text-green-400" />
			<p className="mt-4 text-green-400">{message}</p>
			<Button
				onClick={handleCancel}
				className="mt-4 bg-red-400 text-black hover:bg-red-500"
			>
				キャンセル
			</Button>
		</div>
	);
}

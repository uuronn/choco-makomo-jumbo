import { Loader2 } from "lucide-react";

type TeamJoinLoadingProps = {
	message: string;
};

export default function TeamJoinLoading({ message }: TeamJoinLoadingProps) {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<Loader2 className="h-8 w-8 animate-spin text-green-400" />
			<p className="mt-4 text-green-400">{message}</p>
		</div>
	);
}

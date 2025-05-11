import type { User } from "~/type/user";

type Props = {
	user: User;
};

export default function PcHomeScreen({ user }: Props) {
	return (
		<div className="p-10 text-left">
			💻 デスクトップ版へようこそ！{user.name ?? user.uid} さん！
		</div>
	);
}

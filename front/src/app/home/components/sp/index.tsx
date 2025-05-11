import type { User } from "~/type/user";

type Props = {
	user: User;
};

export default function SpHomeScreen({ user }: Props) {
	return (
		<div className="p-4 text-center">
			📱 モバイル版です！こんにちは、{user.name ?? user.uid} さん！
		</div>
	);
}

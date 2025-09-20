import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

type MeResponse = {
	id: string;
	name: string;
	email: string;
	photoUrl?: string;
	point?: number;
};

export const Route = createRootRoute({
	component: () => {
		const [me, setMe] = useState<MeResponse | null>(null);

		useEffect(() => {
			(async () => {
				try {
					const res = await fetch("/api/me", {
						credentials: "include", // セッション Cookie を送る
					});
					if (res.ok) {
						const data = await res.json();
						setMe(data);
					}
				} catch (err) {
					console.error("Failed to fetch /me", err);
				}
			})();
		}, []);

		return (
			<div className="w-screen h-full flex-col flex">
				{/* 縦向き時のみ表示されるメッセージ */}
				<div className="landscape-only-message">
					このアプリは横向きでの利用を推奨しています。端末を回転させてください。
					<div className="rotate-phone">
						<div className="phone" />
						<div className="arrow">➡️</div>
						<div className="landscape" />
					</div>
				</div>

				<div className="h-full space-x-4 p-4">
					<Link to="/">Home</Link>
					<Link to="/auth/login">Login</Link>
				</div>

				{/* ログインユーザー情報を表示 */}
				{me ? (
					<div className="p-4 border-t">
						<p>👤 {me.name}</p>
						<p>📧 {me.email}</p>
						{me.photoUrl && (
							<img
								src={me.photoUrl}
								alt="Profile"
								className="w-12 h-12 rounded-full mt-2"
							/>
						)}
						<p>💰 {me.point ?? 0} pt</p>
					</div>
				) : (
					<div className="p-4 border-t text-gray-500">未ログイン</div>
				)}

				<Outlet />
			</div>
		);
	},
});

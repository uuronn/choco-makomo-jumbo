import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
// import { MatrixRainCanvas } from "../components/MatrixRainCanvas";
// import { FooterNavigation } from "../components/FooterNavigation";

export const Route = createRootRoute({
	component: () => (
		<div className="w-screen h-full flex-col flex">
			{/* <MatrixRainCanvas /> */}

			{/* 縦向き時のみ表示されるメッセージ */}
			<div className="landscape-only-message">
				このアプリは横向きでの利用を推奨しています。端末を回転させてください。
				<div className="rotate-phone">
					<div className="phone" />
					<div className="arrow">➡️</div>
					<div className="landscape" />
				</div>
			</div>

			<div className="h-full">
				<Link to="/">Home</Link>
				<Link to="/auth/login">Login</Link>

				<Outlet />
			</div>

			{/* <FooterNavigation /> */}
		</div>
	),
});

import { GoogleLoginButton } from "./GoogleLoginButton";

export const LoginForm = () => {
	return (
		<div className="p-8 rounded-lg border border-emerald-500/50 bg-black/60 backdrop-blur-md shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-pulse-slow">
			<div className="mb-8 text-center relative">
				<div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
				<h1 className="text-5xl font-bold tracking-wider text-emerald-500 mb-2 font-mono relative">
					技術大戦争
					<span className="absolute -inset-1 bg-emerald-500/20 blur-sm rounded-lg -z-10" />
				</h1>
				<p className="text-emerald-300/80 text-sm tracking-[0.5em] mt-2">
					TECHNOLOGY WAR
				</p>
			</div>

			<div className="space-y-6">
				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t border-emerald-500/30" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-black px-2 text-emerald-400">
							Access Terminal
						</span>
					</div>
				</div>

				<GoogleLoginButton />

				<div className="text-center text-xs text-emerald-400/60 mt-6">
					<p className="relative inline-block">
						<span className="absolute -inset-1 bg-emerald-500/10 blur-sm rounded-lg -z-10" />
						login with google
					</p>
				</div>
			</div>

			<div className="mt-8 text-center">
				<p className="text-emerald-300/60 text-xs">技術大戦争 | TECH WAR</p>
			</div>
		</div>
	);
};

import {
	ChevronRightIcon,
	DatabaseIcon,
	ShieldIcon,
	ZapIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { User } from "~/type/user";
import { OnlineUserCounter } from "../OnlineUserCounter";
import { EditUserName } from "../EditUserName";
import { FOOTER_ITEMS, NAV_ITEMS } from "../../constant";
import { getRatingTitle } from "~/lib/getRatingTitle";

type Props = {
	user: User;
};

export default async function SpHomeScreen({ user }: Props) {
	const ratingTitle = getRatingTitle(user.rating);

	return (
		<div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 overflow-hidden">
			{/* Background grid effect */}
			<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2MmgtMnYtMnptLTQgMHYyaC0ydi0yaDJ6bTIgMGgydjJoLTJ2LTJ6bS02IDBoMnYyaC0ydi0yem0yLTRoMnYyaC0ydi0yem0yIDBIMzZ2Mmgtc3YtMnptMCA0aDJ2MmgtMnYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')]" />

			{/* Animated circuit lines */}
			<div className="absolute inset-0 overflow-hidden opacity-20">
				<div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse-line-horizontal" />
				<div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-green-500 to-transparent animate-pulse-line-vertical" />
				<div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse-line-horizontal" />
				<div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-green-500 to-transparent animate-pulse-line-vertical" />
			</div>

			<div className="w-[660px] h-[375px] bg-black/80 backdrop-blur-sm rounded-xl shadow-[0_0_15px_rgba(0,255,128,0.3)] border border-green-500/30 overflow-hidden relative z-10">
				{/* User Profile */}
				<div className="border-b border-green-500/30 bg-black/50 p-2">
					<div className="flex items-center gap-2">
						<div className="relative">
							<Image
								src={user.photoUrl || "/placeholder.svg"}
								alt="ユーザーアバター"
								width={40}
								height={40}
								className="object-cover rounded-full border-2 border-green-500/50"
							/>
							<div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-3 h-3 flex items-center justify-center">
								<div className="w-1.5 h-1.5 bg-black rounded-full" />
							</div>
						</div>

						<div className="flex-1 text-sm">
							{/* 名前表示/編集 */}
							<EditUserName currentName={user.name} />

							{/* 技術ポイント表示 */}
							<div className="flex items-center gap-1 mt-1">
								<DatabaseIcon className="h-3 w-3 text-green-400" />
								<span className="text-xs text-green-400 font-mono">
									技術ポイント: <span className="font-bold">{user.point}</span>
								</span>
							</div>
						</div>
					</div>

					{/* 下部：称号と技術力 */}
					<div className="mt-2 flex gap-2 text-xs">
						{/* 称号表示 */}
						<div
							className={`flex items-center gap-1 px-2 py-1 rounded-md border ${ratingTitle.bgColor} ${ratingTitle.borderColor} ${ratingTitle.glowColor} relative overflow-hidden animate-fade-in-scale`}
						>
							<ShieldIcon className={`h-3 w-3 ${ratingTitle.color}`} />
							<span className={`font-mono font-bold ${ratingTitle.color}`}>
								{ratingTitle.title}
							</span>
							<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine" />
						</div>

						{/* 技術力表示 */}
						<div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-md border border-yellow-500/30 shadow-[0_0_6px_rgba(234,179,8,0.2)] animate-slide-in-left">
							<ZapIcon className="h-3 w-3 text-yellow-400" />
							<span className="text-yellow-400 font-mono">
								技術力: <span className="font-bold">{user.rating}</span>
							</span>
						</div>
					</div>
				</div>

				<div className="p-2 grid grid-cols-2 gap-2">
					{NAV_ITEMS.map((item) => (
						<Link
							href={item.path}
							key={item.id}
							className="relative overflow-hidden group rounded-lg border border-green-500/30 transition-all duration-300 hover:shadow-[0_0_12px_rgba(0,255,128,0.3)] hover:border-green-400/50"
						>
							<div className={`bg-gradient-to-br ${item.color} p-2 h-full`}>
								<div className="flex flex-col h-full">
									<div className="flex items-center gap-1 mb-1">
										{item.icon}
										<h2 className="text-sm font-bold text-white">
											{item.title}
										</h2>
									</div>
									<p className="text-xs text-white/80 mb-1">
										{item.description}
									</p>

									<div className="mt-auto flex justify-end">
										<div className="bg-black/30 rounded-full p-0.5">
											<ChevronRightIcon className="h-4 w-4 text-white" />
										</div>
									</div>
								</div>

								{/* Scan line */}
								<div className="absolute inset-0 bg-white/5 mix-blend-overlay pointer-events-none animate-scan-line" />

								{/* Hover glow effect */}
								<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-glow" />
							</div>
						</Link>
					))}
				</div>

				<div className="p-2 border-t border-green-500/30 bg-black/50 text-xs">
					<div className="flex justify-between items-center">
						<div className="text-green-500/70 font-mono flex items-center gap-1">
							<div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
							<OnlineUserCounter />
						</div>
						<div className="text-green-500/70 font-mono">v1.0.0-beta</div>
					</div>

					{/* フッターナビゲーション */}
					<div className="mt-1 flex justify-center gap-2">
						{FOOTER_ITEMS.map((item) => (
							<Link
								key={item.id}
								href={item.path}
								className="flex items-center gap-0.5 text-green-400 hover:text-green-300 transition-colors px-1 py-0.5 rounded-md hover:bg-green-500/10"
							>
								{item.icon}
								<span className="text-xs">{item.title}</span>
							</Link>
						))}
					</div>
				</div>
			</div>

			{/* Tech decorations around the card */}
			<div className="absolute bottom-2 left-2 text-green-500/30 font-mono text-xs">
				<div>SYS:ONLINE</div>
			</div>

			<div className="absolute top-2 right-2 text-green-500/30 font-mono text-xs">
				<div className="flex items-center gap-0.5">
					<div className="w-1 h-1 bg-green-500 rounded-full" />
				</div>
			</div>
		</div>
	);
}

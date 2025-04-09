import { Shield } from "lucide-react";

interface ShieldIndicatorProps {
	count: number;
	isEnemy?: boolean;
}

export function ShieldIndicator({
	count,
	isEnemy = false,
}: ShieldIndicatorProps) {
	if (!count || count <= 0) return null;

	return (
		<div className="absolute -top-2 -right-2 z-10">
			<div
				className={`relative ${isEnemy ? "text-red-400" : "text-green-400"}`}
			>
				{/* Outer shield glow effect */}
				<div className="absolute inset-0 shield-pulse">
					<Shield className="w-8 h-8 opacity-50" />
				</div>

				{/* Inner shield with hexagon pattern */}
				<div className="relative shield-rotate">
					<svg
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							fill={
								isEnemy ? "rgba(248, 113, 113, 0.2)" : "rgba(74, 222, 128, 0.2)"
							}
						/>
						<path
							d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeDasharray="1 2"
						/>
					</svg>
				</div>

				{/* Shield count */}
				<div className="absolute inset-0 flex items-center justify-center font-bold text-xs">
					{count}
				</div>
			</div>
		</div>
	);
}

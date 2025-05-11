export const getRatingTitle = (
	rating: number,
): {
	title: string;
	color: string;
	bgColor: string;
	borderColor: string;
	glowColor: string;
} => {
	if (rating >= 10000)
		return {
			title: "グランドマスターエンジニア",
			color: "text-purple-300",
			bgColor: "bg-purple-900/30",
			borderColor: "border-purple-500/50",
			glowColor: "shadow-[0_0_8px_rgba(188,85,247,0.4)]",
		};
	if (rating >= 8000)
		return {
			title: "レジェンドエンジニア",
			color: "text-purple-300",
			bgColor: "bg-purple-900/30",
			borderColor: "border-purple-500/50",
			glowColor: "shadow-[0_0_8px_rgba(108,85,147,0.4)]",
		};
	if (rating >= 6000)
		return {
			title: "リードエンジニア",
			color: "text-red-300",
			bgColor: "bg-red-900/30",
			borderColor: "border-red-500/50",
			glowColor: "shadow-[0_0_8px_rgba(239,68,68,0.4)]",
		};
	if (rating >= 4500)
		return {
			title: "シニアエンジニア",
			color: "text-yellow-300",
			bgColor: "bg-yellow-900/30",
			borderColor: "border-yellow-500/50",
			glowColor: "shadow-[0_0_8px_rgba(234,179,8,0.4)]",
		};
	if (rating >= 4000)
		return {
			title: "ちょっとできるエンジニア",
			color: "text-green-300",
			bgColor: "bg-green-900/30",
			borderColor: "border-green-500/50",
			glowColor: "shadow-[0_0_8px_rgba(34,197,94,0.4)]",
		};
	if (rating >= 3500)
		return {
			title: "ミドルエンジニア",
			color: "text-blue-300",
			bgColor: "bg-blue-900/30",
			borderColor: "border-blue-500/50",
			glowColor: "shadow-[0_0_8px_rgba(59,130,246,0.4)]",
		};
	if (rating >= 3000)
		return {
			title: "なんも分からんエンジニア",
			color: "text-indigo-300",
			bgColor: "bg-indigo-900/30",
			borderColor: "border-indigo-500/50",
			glowColor: "shadow-[0_0_8px_rgba(99,102,241,0.4)]",
		};
	if (rating >= 2500)
		return {
			title: "ジュニアエンジニア",
			color: "text-cyan-300",
			bgColor: "bg-cyan-900/30",
			borderColor: "border-cyan-500/50",
			glowColor: "shadow-[0_0_8px_rgba(34,211,238,0.4)]",
		};
	if (rating >= 2000)
		return {
			title: "完全に理解したエンジニア",
			color: "text-teal-300",
			bgColor: "bg-teal-900/30",
			borderColor: "border-teal-500/50",
			glowColor: "shadow-[0_0_8px_rgba(20,184,166,0.4)]",
		};
	return {
		title: "駆け出しエンジニア",
		color: "text-gray-300",
		bgColor: "bg-gray-900/30",
		borderColor: "border-gray-500/50",
		glowColor: "shadow-[0_0_8px_rgba(156,163,175,0.4)]",
	};
};

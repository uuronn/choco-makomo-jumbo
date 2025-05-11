import Link from "next/link";
import { cn } from "~/lib/utils";
import { Users } from "lucide-react";
import { usePathname } from "next/navigation";

const Navigation = () => {
	const pathname = usePathname();

	return (
		<nav className="flex items-center space-x-4">
			<Link
				href="/team-rooms"
				className={cn(
					"flex items-center space-x-2 hover:text-green-400 transition-colors",
					pathname === "/team-rooms" ? "text-green-400" : "text-green-400/70",
				)}
			>
				<Users className="h-4 w-4" />
				<span>チーム対戦</span>
			</Link>
		</nav>
	);
};

export default Navigation;

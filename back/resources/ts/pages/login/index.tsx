import { Link } from "@tanstack/react-router";
import { LoginForm } from "./components/LoginForm";

export default function LoginPage() {
	return (
		<div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden">
			<Link to="/">Home</Link>
			こんにちは
			<div className="absolute inset-0 bg-gradient-radial from-transparent to-black opacity-70" />
			<div className="relative z-10 w-full max-w-md">
				<LoginForm />
			</div>
		</div>
	);
}

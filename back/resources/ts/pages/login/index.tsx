import { Link } from "@tanstack/react-router";
import { LoginForm } from "./components/LoginForm";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";

export default function LoginPage() {
	//     const token = document
	//   .querySelector('meta[name="csrf-token"]')
	//   ?.getAttribute("content");

	const test = async function loginWithGoogle() {
		const result = await signInWithPopup(auth, googleProvider);
		const idToken = await result.user.getIdToken();

		console.log(idToken);

		const res = await fetch("https://www.issei.website/api/auth/test", {
			headers: {
				Authorization: `Bearer ${idToken}`,
			},
			credentials: "include",
		});

		const data = await res.json();
		console.log(data);

		// ここで Laravel に送る
		//   const res = await fetch("/api/firebase-login", {
		//     method: "POST",
		//     headers: { "Content-Type": "application/json" },
		//     credentials: "include",
		//     body: JSON.stringify({ token: idToken }),
		//   });

		//   if (!res.ok) throw new Error("Login failed");
		//   return res.json();
	};

	return (
		<div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden">
			<Link to="/">Home</Link>
			こんにちは
			<button onClick={() => test()}>test</button>
			<div className="absolute inset-0 bg-gradient-radial from-transparent to-black opacity-70" />
			<div className="relative z-10 w-full max-w-md">
				<LoginForm />
			</div>
		</div>
	);
}

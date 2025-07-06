"use client";

import { FcGoogle } from "react-icons/fc";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "~/lib/firebase";
import { signInWithPopup } from "firebase/auth";

export const GoogleLoginButton = () => {
	const router = useRouter();

	const handleSignIn = async () => {
		const result = await signInWithPopup(auth, googleProvider);
		const token = await result.user.getIdToken(true);

		await fetch("/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token }),
		});

		router.push("/home");
	};

	return (
		<Button
			onClick={handleSignIn}
			variant="outline"
			className="w-full h-12 flex items-center justify-center gap-2 border-2 hover:bg-purple-50 transition-colors cursor-pointer"
		>
			<FcGoogle className="h-5 w-5" />
			<span>Googleでログイン</span>
		</Button>
	);
};

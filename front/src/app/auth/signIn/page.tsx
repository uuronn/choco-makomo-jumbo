"use client";

import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "~/lib/firebase";

export default function SignInPage() {
	const router = useRouter();

	const handleGoogleSignIn = async () => {
		try {
			const res = await signInWithPopup(auth, googleProvider);

			if (!res.user) {
				throw new Error("Google Sign-In Error");
			}

			// 既存ユーザーか確認
			const checkUser = await fetch(
				`http://163.44.121.57/users/${res.user.uid}`,
			);

			if (checkUser.ok) {
				router.push(`/${res.user.uid}`);
				return;
			}

			await fetch("http://163.44.121.57/users", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					id: res.user.uid,
					name: res.user.displayName,
					email: res.user.email,
				}),
			});

			router.push(`/${res.user.uid}`);
		} catch (error) {
			console.error("Google Sign-In Error", error);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<h1 className="text-2xl font-bold">Sign In</h1>
			<button type="button" onClick={handleGoogleSignIn} className="mt-4">
				Sign in with Google
			</button>
		</div>
	);
}

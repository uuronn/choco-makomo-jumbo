"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "~/lib/firebase";

type UserContextType = {
	user: { uid: string; name?: string } | null | undefined;
	handleSignIn: () => void;
	handleSignOut: () => void;
};

const UserContext = createContext<UserContextType>({
	user: null,
	handleSignIn: () => {},
	handleSignOut: () => {},
});

export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<
		{ uid: string; name?: string } | null | undefined
	>(undefined);
	const router = useRouter();

	const handleSignIn = async () => {
		const result = await signInWithPopup(auth, googleProvider);
		const token = await result.user.getIdToken();

		// Laravelに確認
		const check = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${result.user.uid}/checkUser`,
		);

		if (!check.ok) {
			await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					id: result.user.uid,
					name: result.user.displayName,
					email: result.user.email,
					photoUrl: result.user.photoURL,
				}),
			});
		}

		// ✅ Laravelとの同期が完了した後にCookie保存
		await fetch("/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token }),
		});

		setUser(result.user);
		router.push("/");
	};
	const handleSignOut = async () => {
		await signOut(auth);
		await fetch("/api/auth/logout", { method: "POST" });
		setUser(null);
		router.push("/auth/signIn");
	};

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (u) => {
			if (u) {
				const token = await u.getIdToken();
				await fetch("/api/auth/login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ token }),
				});
				setUser(u);
			} else {
				setUser(null);
				await fetch("/api/auth/logout", { method: "POST" });
			}
		});

		return () => unsubscribe();
	}, []);

	if (user === undefined) return <div>認証中...</div>;

	return (
		<UserContext.Provider value={{ user, handleSignIn, handleSignOut }}>
			{children}
		</UserContext.Provider>
	);
};

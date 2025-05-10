"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "~/lib/firebase";

type UserContextType = {
	user: any;
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
	const [user, setUser] = useState<any>(undefined);
	const router = useRouter();

	const handleSignIn = async () => {
		const result = await signInWithPopup(auth, googleProvider);
		const token = await result.user.getIdToken();

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

	if (user === undefined) return <div>Loading...</div>;

	return (
		<UserContext.Provider value={{ user, handleSignIn, handleSignOut }}>
			{children}
		</UserContext.Provider>
	);
};

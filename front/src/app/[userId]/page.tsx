"use client";

import { useEffect, useState } from "react";
import { auth } from "~/lib/firebase";
import { useRouter } from "next/navigation";

export default function HomePage() {
	const [user, setUser] = useState(auth.currentUser);
	const router = useRouter();

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			if (!user) {
				router.push("/auth/signIn");
			} else {
				setUser(user);
			}
		});
		return () => unsubscribe();
	}, [router]);

	const handleLogout = async () => {
		await auth.signOut();
		router.push("/auth/signIn");
	};

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<h1 className="text-2xl font-bold">Dashboard</h1>
			{user && <p className="mt-2">Welcome, {user.displayName}!</p>}
			<button type="button" onClick={handleLogout} className="mt-4">
				Logout
			</button>
		</div>
	);
}

"use client";

import { useEffect } from "react";
import { auth } from "~/lib/firebase";
import { useRouter } from "next/navigation";

export default function HomePage() {
	// const [user] = useState(auth.currentUser);
	const router = useRouter();

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			if (!user) {
				router.push("/auth/signIn");
			} else {
				router.push(`/${user.uid}`);
			}
		});
		return () => unsubscribe();
	}, [router]);

	// const handleLogout = async () => {
	// 	await auth.signOut();
	// 	router.push("/auth/signIn");
	// };

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<h1 className="text-2xl font-bold">Dashboard</h1>
			{/* {user && <p className="mt-2">Welcome, {user.displayName}!</p>}
			<button type="button" onClick={handleLogout} className="mt-4">
				Logout
			</button> */}
		</div>
	);
}

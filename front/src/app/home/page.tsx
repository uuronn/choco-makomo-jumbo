import { cookies } from "next/headers";
import { adminAuth } from "~/lib/firebase-admin";
import PcHomePage from "./components/pc";
import SpHomePage from "./components/sp";

export default async function HomePage() {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;
	const device = cookieStore.get("device")?.value;

	let user: { uid: string; name?: string } | null = null;

	if (token) {
		try {
			const decoded = await adminAuth.verifyIdToken(token);

			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${decoded.uid}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!res.ok) throw new Error("Failed to fetch user data");

			const data = await res.json();
			user = data;
		} catch (e) {
			console.warn("⚠️ トークンの検証またはユーザー取得に失敗", e);
		}
	}

	if (!user) {
		return <div className="p-4">🔒 ログインしてね</div>;
	}

	if (device === "mobile") {
		return <SpHomePage user={user} />;
	}

	return <PcHomePage user={user} />;
}

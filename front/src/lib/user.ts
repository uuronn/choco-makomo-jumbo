import { adminAuth } from "./firebase-admin";

export const fetchUserFromToken = async (token: string) => {
	try {
		const decoded = await adminAuth.verifyIdToken(token);

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${decoded.uid}`,
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);

		if (!res.ok) throw new Error("Failed to fetch user data");

		const user = await res.json();

		if (!user) {
			throw new Error("ユーザーが見つかりませんでした。");
		}

		return user;
	} catch (e) {
		console.error("⚠️ トークンの検証またはユーザー取得に失敗", e);
	}
};

import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
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
	} catch (e: unknown) {
		// トークン期限切れなど、Firebase Authの典型的なエラーを検出
		const isTokenError =
			typeof e === "object" &&
			e !== null &&
			"code" in e &&
			["auth/id-token-expired", "auth/argument-error"].includes(
				(e as { code: string }).code,
			);

		// リダイレクトレスポンスを返す
		if (isTokenError) {
			redirect("/auth/login");
		}

		// それ以外はサーバーエラー扱い
		return new NextResponse("Internal Server Error", { status: 500 });
	}
};

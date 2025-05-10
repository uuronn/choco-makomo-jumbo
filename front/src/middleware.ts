import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
	const token = req.cookies.get("token")?.value;
	const url = req.nextUrl.clone();

	// ここでは verifyIdToken は使わず、Cookieがあるかだけ見る
	if (!token && url.pathname.startsWith("/[userId]")) {
		url.pathname = "/auth/signIn";
		return NextResponse.redirect(url);
	}

	const ua = req.headers.get("user-agent") || "";
	const isMobile = /iPhone|Android|Mobile|iPad/.test(ua);

	const res = NextResponse.next();
	res.cookies.set("device", isMobile ? "mobile" : "desktop");

	return res;
}

export const config = {
	matcher: ["/:path*"],
};

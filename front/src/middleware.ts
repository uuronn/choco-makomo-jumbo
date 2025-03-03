import { type NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/firebase";

export async function middleware(req: NextRequest) {
	const user = auth.currentUser;
	const url = req.nextUrl.clone();

	if (!user && url.pathname.startsWith("/[userId]")) {
		url.pathname = "/auth/signIn";
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/:path*"],
};

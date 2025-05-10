import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const { token } = await req.json();

	const res = NextResponse.json({ message: "ok" });
	res.cookies.set("token", token, {
		httpOnly: true,
		secure: true,
		sameSite: "lax",
		path: "/",
	});
	return res;
}

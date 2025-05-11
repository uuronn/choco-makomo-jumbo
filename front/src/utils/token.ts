import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export const getTokenFromCookies = (cookieStore: ReadonlyRequestCookies) => {
	const token = cookieStore.get("token")?.value;

	if (!token) {
		throw new Error(
			"トークンが見つかりませんでした。認証されていない可能性があります。",
		);
	}

	return token;
};

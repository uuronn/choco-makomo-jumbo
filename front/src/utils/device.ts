import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export type Device = "mobile" | "desktop";

export const getDeviceFromCookies = (cookieStore: ReadonlyRequestCookies) => {
	const device = cookieStore.get("device")?.value as Device | undefined;

	if (!device) {
		throw new Error("デバイスが検知できませんでした。");
	}

	return device;
};

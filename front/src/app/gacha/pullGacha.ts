"use server";

import { cookies } from "next/headers";
import { fetchUserFromToken } from "~/lib/user";
import { getTokenFromCookies } from "~/utils/token";

export const pullGacha = async () => {
	const cookieStore = await cookies();
	const token = getTokenFromCookies(cookieStore);
	// const device = getDeviceFromCookies(cookieStore);

	const user = await fetchUserFromToken(token);

	console.info("token:", token);
	console.info("User:", user);

	// if (availablePoints < 10) return;

	// setAvailablePoints((prev) => prev - 10);
	// setIsAnimating(true);
	// setShowResult(false);
	// setLoadingProgress(0);

	// // ローディングバーのアニメーション
	// let progress = 0;
	// const loadingInterval = setInterval(() => {
	// 	progress += 2;
	// 	setLoadingProgress(progress);

	// 	if (progress > 85) {
	// 		setLoadingBarColor("bg-yellow-500");
	// 	} else if (progress > 65) {
	// 		setLoadingBarColor("bg-blue-500");
	// 	}

	// 	if (progress >= 100) {
	// 		clearInterval(loadingInterval);
	// 	}
	// }, 50);

	if (!user) return console.error("User not found");

	try {
		console.info(
			"process.env.NEXT_PUBLIC_BASE_URL",
			process.env.NEXT_PUBLIC_BASE_URL,
		);
		console.info("user", user);
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/gacha`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					userId: user.id,
				}),
			},
		);

		// clearInterval(loadingInterval);
		// setLoadingProgress(100);

		if (!response.ok) {
			const text = await response.text();
			console.error("Gacha API error:", text);
			throw new Error("API request failed");
		}

		const data = await response.json();

		console.info("Gacha result:", data);
		// setResult(data);
		// setShowNewBadge(data.isNew || false);
		// setShowResult(true);

		// if (data.isNew) {
		// 	triggerConfetti();
		// }
	} catch (error) {
		console.error("Gacha API error:", error);
		// clearInterval(loadingInterval);
		// setError("ガチャの実行中にエラーが発生しました");
	} finally {
		// setIsAnimating(false);
	}
};

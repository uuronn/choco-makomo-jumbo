export const fetchOnlineUserCount = async (token: string) => {
	try {
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/onlineUsers`,
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			},
		);

		const onlineUserCount = (await res.json()) as number;

		return onlineUserCount;
	} catch (e) {
		console.error("Failed to fetch onlineUserCount:", e);
	}
};

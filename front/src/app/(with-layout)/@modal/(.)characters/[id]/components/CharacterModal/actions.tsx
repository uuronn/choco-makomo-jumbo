"use server";

import { revalidateTag } from "next/cache";

export const developCharacter = async (
	userId: string,
	characterId: string,
	statPoints: { life: number; power: number; speed: number },
	token: string,
) => {
	await fetch(
		`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/characters/${characterId}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			method: "PUT",
			body: JSON.stringify({
				life: statPoints.life,
				power: statPoints.power,
				speed: statPoints.speed,
			}),
		},
	);

	revalidateTag(`character-${characterId}`);
};

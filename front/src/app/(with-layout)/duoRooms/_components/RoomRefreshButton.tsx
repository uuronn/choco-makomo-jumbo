"use client";

import { revalidateTag } from "next/cache";
import { Button } from "~/components/ui/button";

export const RoomRefreshButton = () => {
	const handleRefresh = async () => {
		"use server";

		revalidateTag("rooms");
	};

	return (
		<Button
			onClick={handleRefresh}
			className="bg-green-400 text-black hover:bg-green-500 text-sm"
		>
			更新
		</Button>
	);
};

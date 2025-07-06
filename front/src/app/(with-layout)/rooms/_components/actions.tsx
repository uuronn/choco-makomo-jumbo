"use server";

import { revalidateTag } from "next/cache";

export const handleRefresh = async () => {
	"use server";

	revalidateTag("rooms");
};

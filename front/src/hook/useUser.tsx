import useSwr from "swr";

type User = {
	id: string;
	name: string;
	email: string;
	photoUrl: string;
	point: number;
};

const fetcher = async (userId: string): Promise<User> => {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}`,
	);

	if (!res.ok) {
		throw new Error("ユーザー情報の取得に失敗しました");
	}

	return res.json();
};

export const useUser = (userId: string | null) => {
	return useSwr(userId, userId ? fetcher : null);
};

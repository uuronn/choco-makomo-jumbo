"use client";

import useSWR from "swr";

const fetcher = (url: string, token: string) =>
	fetch(url, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		cache: "no-store",
	}).then((res) => res.json());

export const useDuoRoomList = (token: string | null) => {
	const shouldFetch = Boolean(token && process.env.NEXT_PUBLIC_BASE_URL);

	const { data, error, isLoading, mutate } = useSWR(
		shouldFetch
			? [`${process.env.NEXT_PUBLIC_BASE_URL}/api/duoRooms`, token]
			: null,
		([url, token]) => fetcher(url, token ?? ""),
	);

	return {
		rooms: data ?? [],
		isLoading,
		isError: !!error,
		mutate,
	};
};

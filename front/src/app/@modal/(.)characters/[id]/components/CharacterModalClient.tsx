"use client";

import { useRouter } from "next/navigation";

export function CharacterModalClient({ id }: { id: string }) {
	const router = useRouter();
	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center">
			<div className="bg-white p-4 rounded shadow">
				<h2>キャラ詳細 (ID: {id})</h2>
				<button type="button" onClick={() => router.back()}>
					閉じる
				</button>
			</div>
		</div>
	);
}

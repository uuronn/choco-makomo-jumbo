"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Character = {
	id: string;
	name: string;
};

type SelectedCharacter = {
	id: string;
	name: string;
	level: number;
};

type Props = {
	userId: string;
	availableCharacters: Character[]; // 外部から取得・受け渡し済み
};

export default function DuoRoomCharacterSelectionClient({
	userId,
	availableCharacters,
}: Props) {
	const { roomId } = useParams();
	const [selected, setSelected] = useState<SelectedCharacter[]>([]);
	const [selection, setSelection] = useState<{
		selected: SelectedCharacter[];
		teammateSelected: SelectedCharacter[];
	}>({
		selected: [],
		teammateSelected: [],
	});

	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!roomId || !userId) return;

		const fetchSelectedCharacters = async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/duoRooms/${roomId}/characterSelection?userId=${userId}`,
					{ headers: { "Content-Type": "application/json" } },
				);
				const data: SelectedCharacter[] = await res.json();

				// console.info("選択キャラ", data.selected);

				// setSelection(data);
			} catch (e) {
				console.error("選択キャラ取得失敗", e);
			}
		};

		fetchSelectedCharacters();
		const interval = setInterval(fetchSelectedCharacters, 1000);
		return () => clearInterval(interval);
	}, [roomId, userId]);

	const canSelectMore = selected.length < 3;

	const handleSelect = async (characterId: string) => {
		if (!roomId || !userId || !canSelectMore) return;
		setLoading(true);
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/duoRooms/${roomId}/characterSelection`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						userId,
						characterId,
						action: "select",
					}),
				},
			);
			if (!res.ok) {
				const data = await res.json();
				alert(data.message ?? "選択に失敗しました");
			}
		} catch (e) {
			console.error("選択エラー", e);
		} finally {
			setLoading(false);
		}
	};

	const handleDeselect = async (characterId: string) => {
		if (!roomId || !userId) return;
		setLoading(true);
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/duoRooms/${roomId}/characterSelection`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						userId,
						characterId,
						action: "deselect",
					}),
				},
			);
			if (!res.ok) {
				const data = await res.json();
				alert(data.message ?? "解除に失敗しました");
			}
		} catch (e) {
			console.error("解除エラー", e);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-4 bg-white p-4 rounded shadow">
			<h2 className="text-lg font-semibold">
				選択済みキャラクター（{selected.length}/3）
			</h2>
			<ul className="space-y-2">
				{selection.selected.map((char) => (
					<li key={char.id} className="flex justify-between items-center">
						<span>
							{char.name} (Lv{char.level})
						</span>
						<button
							onClick={() => handleDeselect(char.id)}
							disabled={loading}
							className="bg-red-500 text-white px-2 py-1 rounded disabled:opacity-50"
						>
							−
						</button>
					</li>
				))}
			</ul>

			<h2>味方が選択したキャラクター</h2>
			<ul>
				{selection.teammateSelected.map((char) => (
					<li key={char.id}>
						{char.name} (Lv{char.level})
					</li>
				))}
			</ul>

			<h2 className="text-lg font-semibold">選択可能キャラクター</h2>
			<ul className="grid grid-cols-2 gap-2">
				{availableCharacters.map((char, i) => {
					const isSelected = selected.some((s) => s.id === char.id);

					console.info("キャラクター", char, "選択済み:", isSelected);
					return (
						<li key={i} className="flex justify-between items-center">
							<span>{char.name}</span>
							{/* <button
								onClick={() => handleSelect(char.characterId)}
								disabled={loading || !canSelectMore || isSelected}
								className="bg-blue-500 text-white px-2 py-1 rounded disabled:opacity-50"
							>
								＋
							</button> */}
						</li>
					);
				})}
			</ul>
		</div>
	);
}

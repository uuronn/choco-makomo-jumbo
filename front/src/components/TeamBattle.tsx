"use client";

import { useState, useEffect } from "react";
import { useUserContext } from "~/context/UserProvider";
import type { TeamRoom, RoomLog } from "~/type/team";
import { Button } from "./ui/button";
import { characterToImagePath } from "~/lib/utils";
import Image from "next/image";
import { enqueueSnackbar } from "notistack";

type TeamBattleProps = {
	room: TeamRoom;
};

export default function TeamBattle({ room }: TeamBattleProps) {
	const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
	const { user } = useUserContext();
	const [logs, setLogs] = useState<RoomLog[]>([]);

	// ユーザーのチーム判定
	const isTeam1Member =
		room.team1.leaderUserId === user?.uid ||
		room.team1.memberUserId === user?.uid;
	const myTeam = isTeam1Member ? room.team1 : room.team2!;
	const enemyTeam = isTeam1Member ? room.team2! : room.team1;

	// 攻撃処理
	const handleAttack = async () => {
		if (!selectedTarget || !user) return;

		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/team-rooms/${room.id}/attack`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						userId: user.uid,
						targetCharacterId: selectedTarget,
					}),
				},
			);

			if (!res.ok) {
				const data = await res.json();
				enqueueSnackbar(data.message, { variant: "error" });
			}
		} catch (e) {
			enqueueSnackbar("攻撃に失敗しました", { variant: "error" });
		}
	};

	// 自分のターンかどうか
	const isMyTurn = room.currentTurnUserId === user?.uid;

	useEffect(() => {
		const fetchLogs = async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/team-rooms/${room.id}/log`,
					{
						headers: { "Content-Type": "application/json" },
					},
				);
				const data = await res.json();
				setLogs(data);
			} catch (e) {
				console.error("ログの取得に失敗しました", e);
			}
		};

		fetchLogs();
		const interval = setInterval(fetchLogs, 1000);
		return () => clearInterval(interval);
	}, [room.id]);

	return (
		<div className="container mx-auto p-4">
			{/* 自分のチーム */}
			<div className="mb-8">
				<h2 className="text-xl font-bold text-green-400 mb-4">自分のチーム</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{myTeam.characters.map((char) => {
						const roomChar = room.roomCharacters.find(
							(rc) =>
								rc.characterId === char.characterId &&
								rc.userId === char.userId,
						);
						if (!roomChar) return null;

						return (
							<div
								key={char.characterId}
								className={`p-4 rounded-lg border ${
									roomChar.isDead
										? "border-red-400/30 bg-red-400/10"
										: "border-green-400/30"
								}`}
							>
								<div className="relative w-16 h-16 mx-auto mb-2">
									<Image
										src={
											characterToImagePath(char.characterId) ||
											"/placeholder.svg"
										}
										alt={char.character.name}
										fill
										className="object-cover rounded-lg"
									/>
								</div>
								<p className="text-center text-green-400">
									{char.character.name}
								</p>
								<div className="text-center text-sm text-green-400/70">
									HP: {roomChar.life}/{roomChar.maxLife}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* 敵チーム */}
			<div>
				<h2 className="text-xl font-bold text-green-400 mb-4">敵チーム</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{enemyTeam.characters.map((char) => {
						const roomChar = room.roomCharacters.find(
							(rc) =>
								rc.characterId === char.characterId &&
								rc.userId === char.userId,
						);
						if (!roomChar) return null;

						return (
							<div
								key={char.characterId}
								className={`p-4 rounded-lg border cursor-pointer ${
									roomChar.isDead
										? "border-red-400/30 bg-red-400/10"
										: selectedTarget === roomChar.id
											? "border-green-400 bg-green-400/20"
											: "border-green-400/30 hover:bg-green-400/10"
								}`}
								onClick={() => {
									if (!roomChar.isDead && isMyTurn) {
										setSelectedTarget(roomChar.id);
									}
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										if (!roomChar.isDead && isMyTurn) {
											setSelectedTarget(roomChar.id);
										}
									}
								}}
								role="button"
								tabIndex={0}
								aria-label={`${char.character.name}を選択`}
							>
								<div className="relative w-16 h-16 mx-auto mb-2">
									<Image
										src={
											characterToImagePath(char.characterId) ||
											"/placeholder.svg"
										}
										alt={char.character.name}
										fill
										className="object-cover rounded-lg"
									/>
								</div>
								<p className="text-center text-green-400">
									{char.character.name}
								</p>
								<div className="text-center text-sm text-green-400/70">
									HP: {roomChar.life}/{roomChar.maxLife}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* アクションボタン */}
			<div className="mt-8 text-center">
				<Button
					onClick={handleAttack}
					disabled={!isMyTurn || !selectedTarget}
					className="bg-green-400 text-black hover:bg-green-500"
				>
					攻撃
				</Button>
			</div>

			{/* ターン表示 */}
			<div className="mt-4 text-center text-green-400">
				{isMyTurn ? "あなたのターンです" : "相手のターンです"}
			</div>

			<div className="mt-8 p-4 border border-green-400/30 rounded-lg max-h-48 overflow-y-auto">
				<h3 className="text-lg font-bold text-green-400 mb-2">バトルログ</h3>
				{logs.map((log) => (
					<div key={log.id} className="text-green-400/70 mb-1">
						{log.description}
					</div>
				))}
			</div>
		</div>
	);
}

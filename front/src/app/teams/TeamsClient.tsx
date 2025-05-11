"use client";

import { useEffect, useState } from "react";
import { useUserContext } from "~/context/UserProvider";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { useUserCharacterList } from "~/hook/useUserCharacter";
import type { Character } from "~/type/character";
import type { Team } from "~/type/team";
import { Users, Plus, ChevronRight } from "lucide-react";
import Image from "next/image";
import { characterToImagePath } from "~/lib/utils";

type TeamsClientProps = {
	initialToken: string;
};

export function TeamsClient({ initialToken }: TeamsClientProps) {
	const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
	const [teams, setTeams] = useState<Team[]>([]);
	const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
	const [myTeam, setMyTeam] = useState<Team | null>(null);

	const { user } = useUserContext();
	const router = useRouter();

	const { data: havingCharacters } = useUserCharacterList(
		user?.uid ?? null,
		initialToken,
	);

	// チーム作成
	const createTeam = async () => {
		if (!user) return;
		try {
			// デバッグ用にトークンを確認
			console.log("Token being sent:", initialToken);

			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/teams/create`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${initialToken}`,
					},
				},
			);

			// デバッグ用にレスポンスを確認
			console.log("Response status:", res.status);
			const data = await res.json();
			console.log("Response data:", data);

			if (res.ok) {
				setMyTeam(data);
				enqueueSnackbar("チームを作成しました", { variant: "success" });
			} else {
				enqueueSnackbar(data.message, { variant: "error" });
			}
		} catch (e) {
			console.error("Team creation error:", e);
			enqueueSnackbar("チーム作成に失敗しました", { variant: "error" });
		}
	};

	// チーム参加
	const joinTeam = async () => {
		if (!user || !selectedTeam) return;
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/teams/${selectedTeam.id}/join`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${initialToken}`,
					},
					body: JSON.stringify({
						userId: user.uid,
					}),
				},
			);
			const data = await res.json();
			if (res.ok) {
				setMyTeam(data);
				enqueueSnackbar("チームに参加しました", { variant: "success" });
			} else {
				enqueueSnackbar(data.message, { variant: "error" });
			}
		} catch (e) {
			enqueueSnackbar("チーム参加に失敗しました", { variant: "error" });
		}
	};

	// キャラクター選択
	const selectCharacter = async (character: Character) => {
		if (!user || !myTeam) return;
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/teams/${myTeam.id}/select-character`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${initialToken}`,
					},
					body: JSON.stringify({
						userId: user.uid,
						characterId: character.characterId,
					}),
				},
			);
			if (res.ok) {
				setSelectedCharacters([...selectedCharacters, character]);
				enqueueSnackbar("キャラクターを選択しました", { variant: "success" });
			} else {
				const data = await res.json();
				enqueueSnackbar(data.message, { variant: "error" });
			}
		} catch (e) {
			enqueueSnackbar("キャラクター選択に失敗しました", { variant: "error" });
		}
	};

	// チーム一覧取得
	useEffect(() => {
		const fetchTeams = async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/teams`,
					{
						headers: {
							Authorization: `Bearer ${initialToken}`,
						},
					},
				);
				const data = await res.json();
				console.log("Fetched teams:", data); // デバッグ用
				if (res.ok) {
					setTeams(data);
				}
			} catch (e) {
				console.error("チーム一覧の取得に失敗しました", e);
			}
		};

		fetchTeams();
	}, [initialToken]);

	// 自分のチーム情報取得
	useEffect(() => {
		const fetchMyTeam = async () => {
			if (!user) return;
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/teams/my-team`,
					{
						headers: {
							Authorization: `Bearer ${initialToken}`,
						},
					},
				);
				const data = await res.json();
				if (res.ok && data) {
					setMyTeam(data);
				}
			} catch (e) {
				console.error("自分のチーム情報の取得に失敗しました", e);
			}
		};

		fetchMyTeam();
	}, [user, initialToken]);

	return (
		<div className="container mx-auto p-4">
			{/* チーム作成/参加セクション */}
			{!myTeam && (
				<div className="mb-8">
					<h2 className="text-xl font-bold text-green-400 mb-4">
						チーム作成/参加
					</h2>
					<div className="flex gap-4">
						<Button
							onClick={createTeam}
							className="bg-green-400 text-black hover:bg-green-500"
						>
							<Plus className="mr-2" /> チーム作成
						</Button>
						<Button
							onClick={joinTeam}
							className="bg-green-400 text-black hover:bg-green-500"
							disabled={!selectedTeam}
						>
							参加 <ChevronRight className="ml-2" />
						</Button>
					</div>
				</div>
			)}

			{/* チーム一覧 */}
			{!myTeam && teams.length > 0 && (
				<div className="mb-8">
					<h2 className="text-xl font-bold text-green-400 mb-4">
						参加可能なチーム
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{teams.map((team) => (
							<div
								key={team.id}
								className={`p-4 rounded-lg border cursor-pointer ${
									selectedTeam?.id === team.id
										? "border-green-400 bg-green-400/20"
										: "border-green-400/30 hover:bg-green-400/10"
								}`}
								onClick={() => setSelectedTeam(team)}
							>
								<div className="flex items-center gap-4">
									<Image
										src={team.leaderUser.photoUrl || "/placeholder.svg"}
										alt={team.leaderUser.name}
										width={48}
										height={48}
										className="rounded-full"
									/>
									<div>
										<p className="font-bold text-green-400">
											{team.leaderUser.name}のチーム
										</p>
										<p className="text-sm text-green-400/70">メンバー募集中</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* 自分のチーム情報 */}
			{myTeam && (
				<div>
					<h2 className="text-xl font-bold text-green-400 mb-4">マイチーム</h2>
					{/* チームメンバー */}
					<div className="mb-8">
						<h3 className="text-lg font-bold text-green-400 mb-2">メンバー</h3>
						<div className="flex gap-4">
							{myTeam.leaderUser && (
								<div className="p-4 rounded-lg border border-green-400/30">
									<p className="text-green-400">{myTeam.leaderUser.name}</p>
									<p className="text-sm text-green-400/70">リーダー</p>
								</div>
							)}
							{myTeam.memberUser && (
								<div className="p-4 rounded-lg border border-green-400/30">
									<p className="text-green-400">{myTeam.memberUser.name}</p>
									<p className="text-sm text-green-400/70">メンバー</p>
								</div>
							)}
						</div>
					</div>

					{/* キャラクター選択 */}
					<div>
						<h3 className="text-lg font-bold text-green-400 mb-2">
							キャラクター選択
						</h3>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
							{havingCharacters?.map((character) => (
								<div
									key={character.characterId}
									className={`p-4 rounded-lg border cursor-pointer ${
										myTeam.characters?.some(
											(c) => c.characterId === character.characterId,
										)
											? "border-green-400 bg-green-400/20"
											: "border-green-400/30 hover:bg-green-400/10"
									}`}
									onClick={() => {
										if (
											!myTeam.characters?.some(
												(c) => c.characterId === character.characterId,
											)
										) {
											selectCharacter(character);
										}
									}}
								>
									<div className="relative w-16 h-16 mx-auto mb-2">
										<Image
											src={
												characterToImagePath(character.characterId) ||
												"/placeholder.svg"
											}
											alt={character.name}
											fill
											className="object-cover rounded-lg"
										/>
									</div>
									<p className="text-center text-green-400">{character.name}</p>
									<p className="text-center text-sm text-green-400/70">
										Lv.{character.level}
									</p>
								</div>
							))}
						</div>
						<div className="mt-4 text-sm text-green-400/70">
							選択済み: {myTeam.characters?.length || 0}/3
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

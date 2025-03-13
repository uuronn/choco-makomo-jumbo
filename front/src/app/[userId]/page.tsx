"use client";

import { useEffect, useState } from "react";
import { auth } from "~/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
	const [user, setUser] = useState(auth.currentUser);
	const router = useRouter();
	// TODO: 型つけたい
	const [characters, setCharacters] = useState([]);

	useEffect(() => {
		const fetchCharacters = async () => {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/characters`,
			);
			const characters = await res.json();

			setCharacters(characters);
		};
		fetchCharacters();
	}, []);

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			if (!user) {
				router.push("/auth/signIn");
			} else {
				setUser(user);
				router.push(`/${user.uid}`);
			}
		});
		return () => unsubscribe();
	}, [router]);

	const handleLogout = async () => {
		await auth.signOut();
		router.push("/auth/signIn");
	};

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<h1 className="text-2xl font-bold">Dashboard</h1>
			{user && <p className="mt-2">Welcome, {user.displayName}!</p>}
			<button type="button" onClick={handleLogout} className="mt-4">
				Logout
			</button>

			<div>
				ガチャキャラリスト
				<ul className="flex flex-wrap">
					{characters.map((character) => (
						<li key={character.id}>
							<p>{character.name}</p>
							<p>レア度：{character.rarity}</p>
							<Image
								src={character.image_url}
								alt="test"
								width={100}
								height={100}
							/>
							<p>ライフ：{character.base_life}</p>
							<p>パワー：{character.base_power}</p>
							<p>スピード：{character.base_speed}</p>
							<p>スキル：{character.skill}</p>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}

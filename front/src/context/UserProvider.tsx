"use client";

import {
	signInWithPopup,
	signOut,
	type User as FirebaseUser,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import Loading from "~/components/Loading";
import { auth, googleProvider } from "~/lib/firebase";
import type { Character } from "~/type/character";
import type { SelectingRoom } from "~/type/room";

type User = FirebaseUser & { token: string; rate: number };

const UserContext = createContext<{
	handleSignIn: () => void;
	handleSignOut: () => void;
	user: User | null | undefined;
}>({
	handleSignIn: () => {},
	handleSignOut: () => {},
	user: null,
});

export function useUserContext() {
	return useContext(UserContext);
}

type UserProviderProps = {
	children: ReactNode;
};

export const UserProvider = ({ children }: UserProviderProps) => {
	const [user, setUser] = useState<User | null>();
	const [authenticating, setAuthenticating] = useState<boolean>(true);

	const router = useRouter();

	const handleSignIn = async () => {
		try {
			const res = await signInWithPopup(auth, googleProvider);
			if (!res.user) {
				throw new Error("Google Sign-In Error");
			}

			// トークンを取得
			const token = await res.user.getIdToken();

			// 既存ユーザーか確認
			const checkUser = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${res.user.uid}/checkUser`,
			);

			if (checkUser.ok) {
				setUser({ ...res.user, token: token });
				router.push("/");
				return;
			}

			await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					id: res.user.uid,
					name: res.user.displayName,
					email: res.user.email,
					photoUrl: res.user.photoURL,
				}),
			});
			setUser({ ...res.user, token: token });
			router.push("/");
		} catch (error) {
			console.error("Google Sign-In Error", error);
		}
	};

	const handleSignOut = async () => {
		await signOut(auth);
		setUser(null);
		router.push("/auth/signIn");
	};

	useEffect(() => {
		auth.onAuthStateChanged(async (user) => {
			if (user) {
				setUser({ ...user, token: await user.getIdToken() });

				// ユーザーが存在するか確認
				const checkUser = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${user.uid}/checkUser`,
				);

				if (!checkUser.ok) {
					// ユーザーが存在しない場合、新しいユーザーを作成
					await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							id: user.uid,
							name: user.displayName,
							email: user.email,
							photoUrl: user.photoURL,
						}),
					});
				}

				(async () => {
					const res = await fetch(
						`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms`,
					);
					const data = (await res.json()) as SelectingRoom[];

					// ルームのホストユーザーIDと自分のUIDを比較
					const matchingRoom = data.find(
						(room) =>
							room.host_user.id === user.uid ||
							room.guest_user?.id === user.uid,
					);
					if (matchingRoom) {
						router.push(`/rooms/${matchingRoom.id}`);
					}
				})();
			} else {
				setUser(null);
			}
		});
	}, [router.push]);

	useEffect(() => {
		if (user === null) {
			setAuthenticating(false);
			router.push("/auth/signIn");
		} else {
			setAuthenticating(false);
		}
	}, [user, router]);

	if (user === undefined) return <Loading message="認証中" />;

	return (
		<UserContext.Provider
			value={{
				handleSignIn,
				handleSignOut,
				user,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};

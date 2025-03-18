"use client";

import { signInWithPopup, signOut, type User } from "firebase/auth";
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
import { Character } from "~/type/character";
import { SelectingRoom } from "~/type/room";

const UserContext = createContext<{
  handleSignIn: () => void;
  handleSignOut: () => void;
  user: User | null | undefined;
  havingCharacters: Character[];
  fetchCharacters: () => void;
}>({
  handleSignIn: () => {},
  handleSignOut: () => {},
  user: null,
  havingCharacters: [],
  fetchCharacters: () => {},
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
  const [havingCharacters, setHavingCharacters] = useState<Character[]>([]);

  const router = useRouter();

  const handleSignIn = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (!res.user) {
        throw new Error("Google Sign-In Error");
      }
      // 既存ユーザーか確認
      const checkUser = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${res.user.uid}`,
      );

      if (checkUser.ok) {
        setUser(res.user);
        router.push("/");
        return;
      }

      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: res.user.uid,
          name: res.user.displayName,
          email: res.user.email,
          photoUrl: res.user.photoURL,
        }),
      });
      setUser(res.user);
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

  const fetchCharacters = async () => {
    (async () => {
      if (!user) return;
      // キャラクター一覧を取得
      const charRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${user.uid}/characters`,
      );
      const charData = await charRes.json();
      setHavingCharacters(charData);
    })();
  };

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        (async () => {
          // キャラクター一覧を取得
          const charRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${user.uid}/characters`,
          );
          const charData = await charRes.json();
          setHavingCharacters(charData);
        })();
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
  }, []);

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
        havingCharacters,
        fetchCharacters,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

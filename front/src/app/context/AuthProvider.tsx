"use client";

import { signInWithPopup, signOut, UserInfo, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { auth, googleProvider } from "~/lib/firebase";

const AuthContext = createContext<{
  handleSignIn: () => void;
  handleSignOut: () => void;
  user: User | null | undefined;
}>({
  handleSignIn: () => {},
  handleSignOut: () => {},
  user: null,
});

export function useAuth() {
  return useContext(AuthContext);
}

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>();
  const [authenticating, setAuthenticating] = useState<boolean>(true);

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
          point: 50,
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
  };

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
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
      router.push("/");
    }
  }, [user]);

  if (authenticating == true) {
    return <>認証中...</>;
  }

  return (
    <AuthContext.Provider value={{ handleSignIn, handleSignOut, user }}>
      {children}
    </AuthContext.Provider>
  );
};

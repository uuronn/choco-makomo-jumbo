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
    const result = await signInWithPopup(auth, googleProvider);
    setUser(result.user);
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

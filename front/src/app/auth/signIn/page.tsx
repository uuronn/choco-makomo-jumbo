"use client";

import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "~/app/context/AuthProvider";
import { auth, googleProvider } from "~/lib/firebase";

export default function SignInPage() {
  const { handleSignIn } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Sign In</h1>
      <button type="button" onClick={handleSignIn} className="mt-4">
        Sign in with Google
      </button>
    </div>
  );
}

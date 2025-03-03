"use client";

import { useAuth } from "./context/AuthProvider";

export default function HomePage() {
  const { handleSignOut } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <button type="button" onClick={handleSignOut} className="mt-4">
        Logout
      </button>
    </div>
  );
}

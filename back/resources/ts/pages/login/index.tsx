import { Link } from "@tanstack/react-router";
import { LoginForm } from "./components/LoginForm";

export default function LoginPage() {

    const token = document
  .querySelector('meta[name="csrf-token"]')
  ?.getAttribute("content");

    const test = async function login(email: string, password: string) {
  const res = await fetch("https://www.issei.website/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
       "X-CSRF-TOKEN": token || "",
    },
    credentials: "include", // Cookie を送る！
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login failed");
  return res.json();
}
	return (
		<div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden">
			<Link to="/">Home</Link>
			こんにちは
            <button onClick={() => test("email@example.com", "password")}>test</button>
			<div className="absolute inset-0 bg-gradient-radial from-transparent to-black opacity-70" />
			<div className="relative z-10 w-full max-w-md">
				<LoginForm />
			</div>
		</div>
	);
}

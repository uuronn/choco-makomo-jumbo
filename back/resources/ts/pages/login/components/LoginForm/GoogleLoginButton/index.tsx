export const GoogleLoginButton = () => {
	// const router = useRouter();

	const handleSignIn = async () => {
		// const result = await signInWithPopup(auth, googleProvider);
		// const token = await result.user.getIdToken(true);
		// await fetch("/api/auth/login", {
		// 	method: "POST",
		// 	headers: { "Content-Type": "application/json" },
		// 	body: JSON.stringify({ token }),
		// });
		// router.push("/");
	};

	return (
		<button
			type="button"
			onClick={handleSignIn}
			className="w-full h-12 flex items-center justify-center gap-2 border-2 hover:bg-purple-50 transition-colors cursor-pointer"
		>
			{/* <FcGooglg className="h-5 w-5" /> */}
			<span>Googleでログイン</span>
		</button>
	);
};

import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
	dest: "public",
	register: true,
	skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
	images: {
		domains: ["lh3.googleusercontent.com"],
	},
});

export default nextConfig;

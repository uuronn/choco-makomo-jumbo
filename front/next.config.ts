import withPWAInit from "next-pwa";
import runtimeCaching from "next-pwa/cache";

const withPWA = withPWAInit({
	dest: "public",
	register: true,
	skipWaiting: true,
	runtimeCaching: runtimeCaching,
});

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
	images: {
		domains: ["lh3.googleusercontent.com"],
	},
});

export default nextConfig;

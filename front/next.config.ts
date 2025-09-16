import withPWAInit from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
	swcMinify: true,
	images: {
		domains: ["cover.openbd.jp"],
	},
	reactStrictMode: true,
	compiler: {
		removeConsole: process.env.NODE_ENV !== "development",
	},
};

const withPWA = withPWAInit({
	dest: "public",
	disable: process.env.NODE_ENV === "development",
	register: true,
});

export default withPWA(nextConfig);

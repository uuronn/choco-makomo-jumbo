const withPWA = require("next-pwa")({
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

module.exports = nextConfig;

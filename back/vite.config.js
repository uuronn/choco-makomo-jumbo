import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [
		laravel({
			input: [
				"resources/css/app.css",
				"resources/js/app.js",
				"resources/ts/app.tsx",
			],
			refresh: true,
		}),
		tailwindcss(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["favicon.svg", "robots.txt", "apple-touch-icon.png"],
			manifest: {
				name: "Beta Tech War",
				short_name: "TechWar",
				start_url: "/",
				display: "standalone",
				background_color: "#ffffff",
				theme_color: "#0f172a",
				icons: [
					{
						src: "/pwa-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "/pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
				],
			},
		}),
	],
});

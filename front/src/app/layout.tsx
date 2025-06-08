import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "./client-providers";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export default function RootLayout({
	children,
	modal,
}: Readonly<{
	children: React.ReactNode;
	modal: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<head>
				<title>技術大戦争</title>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ClientProviders>
					{children}
					{modal}
				</ClientProviders>
			</body>
		</html>
	);
}

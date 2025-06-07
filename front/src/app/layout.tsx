"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SnackbarProvider } from "notistack";
import { MaintenanceModal } from "~/components/MaintenanceModal";
import { Sidebar } from "~/components/SideBar";

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
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<title>技術大戦争</title>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{/* TODO: メンテナンス終わったら解除する */}
				<MaintenanceModal />
				<SnackbarProvider
					anchorOrigin={{
						vertical: "top",
						horizontal: "right",
					}}
					maxSnack={3}
					style={{ maxWidth: 300 }}
				/>

				<Sidebar />
				{children}
			</body>
		</html>
	);
}

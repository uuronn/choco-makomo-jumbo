"use client";

// import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "../context/UserProvider";
// import { Sidebar } from "~/components/SideBar";
import { SnackbarProvider } from "notistack";
import { MaintenanceModal } from "~/components/MaintenanceModal";

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
				<link rel="icon" href="/character/vue.webp" />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<MaintenanceModal />
				<SnackbarProvider
					anchorOrigin={{
						vertical: "top",
						horizontal: "right",
					}}
					maxSnack={3}
					style={{ maxWidth: 300 }}
				/>
				<UserProvider>
					{/* TODO: メンテナンス終わったら解除する */}
					{/* <Sidebar /> */}
					{children}
				</UserProvider>
			</body>
		</html>
	);
}

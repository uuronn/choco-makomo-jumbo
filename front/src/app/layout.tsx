"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "../context/UserProvider";
import { Sidebar } from "~/components/SideBar";
import { SnackbarProvider } from "notistack";

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
        <SnackbarProvider
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          maxSnack={3}
          style={{ maxWidth: 300 }}
        />
        <UserProvider>
          <Sidebar />
          {children}
        </UserProvider>
      </body>
    </html>
  );
}

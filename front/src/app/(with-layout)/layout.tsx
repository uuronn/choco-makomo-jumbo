import { ClientLayout } from "./client-layout";

export default function RootLayout({
	children,
	modal,
}: Readonly<{
	children: React.ReactNode;
	modal: React.ReactNode;
}>) {
	return (
		<ClientLayout>
			{children}
			{modal}
		</ClientLayout>
	);
}

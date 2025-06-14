"use client";

import { SnackbarProvider } from "notistack";
import { FooterNavigation } from "~/components/FooterNavigation";

export function ClientLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<SnackbarProvider
				anchorOrigin={{ vertical: "top", horizontal: "right" }}
				maxSnack={3}
			>
				{children}

				<FooterNavigation />
			</SnackbarProvider>
		</>
	);
}

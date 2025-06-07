"use client";

import { SnackbarProvider } from "notistack";
import { FooterNavigation } from "~/components/FooterNavigation";

export function ClientProviders({ children }: { children: React.ReactNode }) {
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

"use client";

import { SnackbarProvider } from "notistack";
import { FooterNavigation } from "~/components/FooterNavigation";
import { MatrixRainCanvas } from "../_components/MatrixRainCanvas";

export function ClientLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<SnackbarProvider
				anchorOrigin={{ vertical: "top", horizontal: "right" }}
				maxSnack={3}
			>
				<MatrixRainCanvas />
				<div className="relative z-10">{children}</div>

				<FooterNavigation />
			</SnackbarProvider>
		</>
	);
}

// components/MaintenanceModal.tsx
"use client";

import * as Dialog from "@radix-ui/react-dialog";

export const MaintenanceModal = () => {
	return (
		<Dialog.Root open>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
					<Dialog.Title className="text-xl font-semibold text-gray-900 mb-2">
						現在メンテナンス中です
					</Dialog.Title>
					<Dialog.Description className="text-gray-600">
						ただいまシステムのメンテナンスを行っております。しばらくお待ちください。
					</Dialog.Description>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

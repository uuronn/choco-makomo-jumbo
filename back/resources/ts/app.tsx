import React from "react";
import ReactDOM from "react-dom/client";
import { create } from "zustand";
// import "./index.css"; // Tailwind

const useStore = create<{ count: number; inc: () => void }>((set) => ({
	count: 0,
	inc: () => set((s) => ({ count: s.count + 1 })),
}));

function App() {
	const { count, inc } = useStore();
	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<h1 className="text-2xl font-bold">Hello Laravel + React + TS</h1>
			<p className="mt-4">Count: {count}</p>
			<button
				type="button"
				className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
				onClick={inc}
			>
				Increment
			</button>
		</div>
	);
}

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);

if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker.register("/sw.js");
	});
}

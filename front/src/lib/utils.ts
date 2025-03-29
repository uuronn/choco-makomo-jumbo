import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function characterToImagePath(id: string) {
	console.info("id", id);
	return `/character/${id}.webp`;
}

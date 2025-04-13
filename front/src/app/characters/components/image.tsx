"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import GlitchEffect from "./glitch-effect";

interface CharacterImageProps {
	characterId: string;
	name: string;
	isErrorState: boolean;
	onToggleErrorState: () => void;
}

export default function CharacterImage({
	characterId,
	name,
	isErrorState,
	onToggleErrorState,
}: CharacterImageProps) {
	const [isGlitching, setIsGlitching] = useState(false);
	const [glitchTimeout, setGlitchTimeout] = useState<NodeJS.Timeout | null>(
		null,
	);

	// Function to get image path
	const getImagePath = (id: string, isError: boolean) => {
		const basePath = `/characters/${id}`;
		return isError ? `${basePath}-error.png` : `${basePath}.png`;
	};

	// Handle error state toggle with glitch effect
	const handleToggle = () => {
		setIsGlitching(true);

		// Clear any existing timeout
		if (glitchTimeout) {
			clearTimeout(glitchTimeout);
		}

		// Set a new timeout to turn off glitching
		const timeout = setTimeout(() => {
			setIsGlitching(false);
		}, 800);

		setGlitchTimeout(timeout);

		// Call the parent toggle function
		onToggleErrorState();
	};

	// Clean up timeout on unmount
	useEffect(() => {
		return () => {
			if (glitchTimeout) {
				clearTimeout(glitchTimeout);
			}
		};
	}, [glitchTimeout]);

	return (
		<div
			className="relative w-32 h-32 md:w-80 md:h-80 mb-2 border-2 rounded-lg overflow-hidden shadow-lg"
			style={{
				boxShadow: isErrorState
					? "0 0 15px rgba(239, 68, 68, 0.7)"
					: "0 0 10px rgba(16, 185, 129, 0.5)",
				borderColor: isErrorState ? "#ef4444" : "#10b981",
				transition: "box-shadow 0.5s ease, border-color 0.5s ease",
			}}
		>
			{/* Global glitch effect */}
			<GlitchEffect isActive={isGlitching} />

			{/* Character image with animation */}
			<AnimatePresence mode="wait">
				<motion.div
					key={isErrorState ? "error" : "normal"}
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{
						opacity: 1,
						scale: 1,
						filter: isErrorState
							? "hue-rotate(-45deg) contrast(1.2)"
							: "hue-rotate(0deg)",
					}}
					exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
					transition={{
						type: "spring",
						stiffness: 260,
						damping: 20,
						duration: 0.4,
					}}
					className="w-full h-full relative"
				>
					<Image
						src={getImagePath(characterId, isErrorState) || "/placeholder.svg"}
						alt={name}
						fill
						className="object-cover"
						priority
					/>

					{/* Error state effects */}
					{isErrorState && (
						<>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: [0, 0.7, 0.3, 0.5, 0.2] }}
								transition={{
									duration: 2,
									repeat: Number.POSITIVE_INFINITY,
									repeatType: "reverse",
								}}
								className="absolute inset-0 bg-red-500/20 mix-blend-overlay"
							/>

							{/* Random glitch blocks */}
							{Array.from({ length: 5 }).map((_, i) => (
								<motion.div
									key={i}
									className="absolute bg-red-500/30 mix-blend-screen"
									style={{
										width: `${Math.random() * 30 + 10}px`,
										height: `${Math.random() * 5 + 2}px`,
										left: `${Math.random() * 100}%`,
										top: `${Math.random() * 100}%`,
									}}
									animate={{
										opacity: [0, 0.8, 0],
										x: [0, Math.random() * 20 - 10, 0],
									}}
									transition={{
										duration: Math.random() * 0.5 + 0.2,
										repeat: Number.POSITIVE_INFINITY,
										repeatType: "reverse",
										delay: Math.random() * 2,
									}}
								/>
							))}

							{/* Error warning icon */}
							<motion.div
								className="absolute inset-0 flex items-center justify-center"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
							>
								<motion.div
									animate={{
										rotate: [0, 5, -5, 3, -3, 0],
										scale: [1, 1.02, 0.98, 1],
									}}
									transition={{
										duration: 2,
										repeat: Number.POSITIVE_INFINITY,
										repeatType: "reverse",
									}}
									className="w-1/2 h-1/3 flex items-center justify-center"
								>
									<div className="bg-red-500/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-red-300 transform rotate-12">
										<motion.div
											animate={{ scale: [1, 1.1, 1] }}
											transition={{
												duration: 1.5,
												repeat: Number.POSITIVE_INFINITY,
											}}
										>
											<AlertTriangle className="h-8 w-8 text-white mx-auto" />
										</motion.div>
									</div>
								</motion.div>
							</motion.div>
						</>
					)}
				</motion.div>
			</AnimatePresence>

			{/* Toggle button */}
			<motion.div
				className="absolute bottom-2 right-2 flex items-center gap-1 backdrop-blur-sm border rounded-md px-2 py-1 shadow-lg z-10"
				style={{
					backgroundColor: "rgba(17, 24, 39, 0.8)",
					borderColor: isErrorState
						? "rgba(239, 68, 68, 0.5)"
						: "rgba(16, 185, 129, 0.5)",
				}}
				animate={{
					boxShadow: isErrorState
						? "0 0 8px rgba(239, 68, 68, 0.5)"
						: "0 0 8px rgba(16, 185, 129, 0.5)",
				}}
				transition={{ duration: 0.3 }}
			>
				<Button
					className={`flex items-center gap-1 text-xs transition-all duration-300 ${
						isErrorState
							? "bg-red-500/80 hover:bg-red-600 text-white"
							: "bg-emerald-500/80 hover:bg-emerald-600 text-white"
					}`}
					onClick={handleToggle}
					size="sm"
				>
					<motion.div
						animate={{ rotate: isErrorState ? [0, 360] : [360, 0] }}
						transition={{ duration: 0.5 }}
					>
						{isErrorState ? (
							<AlertTriangle className="h-3 w-3" />
						) : (
							<CheckCircle className="h-3 w-3" />
						)}
					</motion.div>
					<AnimatePresence mode="wait">
						<motion.span
							key={isErrorState ? "error" : "normal"}
							initial={{ opacity: 0, y: 5 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -5 }}
							transition={{ duration: 0.2 }}
						>
							{isErrorState ? "エラー状態" : "通常状態"}
						</motion.span>
					</AnimatePresence>
				</Button>
			</motion.div>
		</div>
	);
}

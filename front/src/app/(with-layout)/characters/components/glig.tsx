"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GlitchEffectProps {
	isActive: boolean;
}

export default function GlitchEffect({ isActive }: GlitchEffectProps) {
	const [glitchLines, setGlitchLines] = useState<number[]>([]);

	useEffect(() => {
		if (isActive) {
			// Create random glitch lines
			const lines = Array.from({ length: 5 }, () =>
				Math.floor(Math.random() * 100),
			);
			setGlitchLines(lines);

			// Clear glitch lines after animation
			const timeout = setTimeout(() => {
				setGlitchLines([]);
			}, 500);

			return () => clearTimeout(timeout);
		}
	}, [isActive]);

	if (!isActive && glitchLines.length === 0) return null;

	return (
		<AnimatePresence>
			{isActive && (
				<motion.div
					className="fixed inset-0 pointer-events-none z-50"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
				>
					{/* Color distortion overlay */}
					<motion.div
						className="absolute inset-0 bg-red-500/10 mix-blend-color-dodge"
						animate={{ opacity: [0, 0.5, 0, 0.3, 0] }}
						transition={{ duration: 0.5, times: [0, 0.2, 0.4, 0.6, 1] }}
					/>

					{/* Horizontal glitch lines */}
					{glitchLines.map((top, i) => (
						<motion.div
							key={i}
							className="absolute left-0 right-0 h-[2px] bg-red-500/70"
							style={{ top: `${top}%` }}
							initial={{ scaleX: 0, x: "-100%" }}
							animate={{
								scaleX: [0, 1, 1, 0],
								x: ["-100%", "0%", "0%", "100%"],
							}}
							transition={{
								duration: 0.3,
								times: [0, 0.3, 0.7, 1],
								delay: i * 0.05,
							}}
						/>
					))}

					{/* Scanline effect */}
					<motion.div
						className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent h-[20px]"
						animate={{ y: ["-100vh", "100vh"] }}
						transition={{ duration: 1, ease: "linear" }}
					/>

					{/* RGB split effect */}
					<div className="absolute inset-0 mix-blend-screen opacity-50">
						<motion.div
							className="absolute inset-0 bg-red-500/20"
							animate={{ x: [0, -5, 3, -2, 0] }}
							transition={{ duration: 0.5 }}
						/>
						<motion.div
							className="absolute inset-0 bg-blue-500/20"
							animate={{ x: [0, 5, -3, 2, 0] }}
							transition={{ duration: 0.5 }}
						/>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

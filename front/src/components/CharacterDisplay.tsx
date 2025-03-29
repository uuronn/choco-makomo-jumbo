"use client";

import type { RoomCharacter } from "~/type/room";
import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import { characterToImagePath } from "~/lib/utils";

export const CharacterDisplay = React.memo(
	({
		character,
		isEnemy,
		isActive,
		effect,
		onClick,
	}: {
		character: RoomCharacter;
		isSelected?: boolean;
		isEnemy: boolean;
		isActive?: boolean;
		effect?: "blink" | "explosion" | "heal" | string;
		onClick: () => void;
	}) => {
		const hpPercentage = (character.life / character.maxLife) * 100;
		let hpColor = "bg-green-500";
		if (hpPercentage < 30) {
			hpColor = "bg-red-500";
		} else if (hpPercentage < 70) {
			hpColor = "bg-yellow-500";
		}

		const auraColor = isEnemy
			? "shadow-[0_0_15px_5px_rgba(239,68,68,0.5)]"
			: "shadow-[0_0_15px_5px_rgba(59,130,246,0.5)]";

		// Define the blink animation variants
		const blinkVariants = {
			blink: {
				x: [0, -3, 3, -2, 2, 0],
				transition: {
					duration: 0.5,
					repeat: Number.POSITIVE_INFINITY,
					repeatType: "loop" as const,
				},
			},
			idle: {
				x: 0,
			},
		};

		return (
			<div
				className={`flex flex-col items-center rounded-lg transition-all`}
				onClick={onClick}
			>
				<div className="relative w-full h-32 mb-2 flex items-center justify-center">
					{isActive && (
						<div className="absolute inset-0 z-0">
							{/* Digital circuit lines */}
							{[...Array(8)].map((_, i) => (
								<motion.div
									key={`circuit-${i}`}
									className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
									style={{
										width: 130 + i * 5,
										height: 130 + i * 5,
										border: isEnemy
											? "1px solid rgba(239, 68, 68, 0.7)"
											: "1px solid rgba(16, 185, 129, 0.7)",
										borderRadius: "5%",
										zIndex: -1,
									}}
									animate={{
										rotate: [0, 360],
										opacity: [0.7, 0.3, 0.7],
										scale: [1, 1 + (i % 2) * 0.05, 1],
									}}
									transition={{
										duration: 8 + i,
										repeat: Number.POSITIVE_INFINITY,
										ease: "linear",
									}}
								/>
							))}

							{[...Array(5)].map((_, i) => (
								<motion.div
									key={`flame-${i}`}
									className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
									style={{
										width: 140 + i * 20,
										height: 140 + i * 20,
										borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
										background: isEnemy
											? `radial-gradient(circle, rgba(239, 68, 68, ${
													0.3 - i * 0.1
												}) 0%, rgba(220, 38, 38, ${
													0.3 - i * 0.05
												}) 70%, transparent 100%)`
											: `radial-gradient(circle, rgba(34, 197, 94, ${
													0.3 - i * 0.1
												}) 0%, rgba(21, 128, 61, ${
													0.3 - i * 0.05
												}) 70%, transparent 100%)`,
										filter: "blur(8px)",
										zIndex: -1,
									}}
									animate={{
										rotate: [
											`${i % 2 === 0 ? -5 : 5}deg`,
											`${i % 2 === 0 ? 5 : -5}deg`,
											`${i % 2 === 0 ? -5 : 5}deg`,
										],
										borderRadius: [
											"40% 60% 70% 30% / 40% 50% 60% 50%",
											"70% 30% 50% 50% / 30% 60% 40% 70%",
											"40% 60% 70% 30% / 40% 50% 60% 50%",
										],
										scale: [0.95, 1.05, 0.95],
									}}
									transition={{
										duration: 2 + i * 0.2,
										repeat: Number.POSITIVE_INFINITY,
										ease: "easeInOut",
										delay: i * 0.1,
									}}
								/>
							))}

							{/* Hexagonal grid pattern */}
							<motion.div
								className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px]"
								style={{
									background: isEnemy
										? `
                      radial-gradient(circle at 50% 50%, transparent 50%, rgba(239, 68, 68, 0.5) 50.5%, transparent 51%),
                      radial-gradient(circle at 50% 50%, transparent 50%, rgba(239, 68, 68, 0.5) 50.5%, transparent 51%)
                    `
										: `
                      radial-gradient(circle at 50% 50%, transparent 50%, rgba(16, 185, 129, 0.5) 50.5%, transparent 51%),
                      radial-gradient(circle at 50% 50%, transparent 50%, rgba(16, 185, 129, 0.5) 50.5%, transparent 51%)
                    `,
									backgroundSize: "20px 20px",
									backgroundPosition: "0 0, 10px 10px",
									zIndex: -1,
									opacity: 0.5,
								}}
								animate={{
									rotate: [0, 180],
									scale: [1, 1.1, 1],
								}}
								transition={{
									duration: 10,
									repeat: Number.POSITIVE_INFINITY,
									ease: "linear",
								}}
							/>
						</div>
					)}

					<motion.div
						className={`absolute inset-0 rounded-lg overflow-hidden flex justify-center items-center`}
						style={{
							animation:
								character.life > 0 && !effect
									? `float 3s ease-in-out infinite`
									: "none",
						}}
						// Apply the blink animation when effect is "blink"
						animate={effect === "blink" ? "blink" : "idle"}
						variants={blinkVariants}
					>
						<Image
							src={
								characterToImagePath(character.character.characterId) ||
								"/placeholder.svg"
							}
							alt=""
							width={100}
							height={100}
							className={`object-cover rounded-4xl ${auraColor}`}
							style={{
								filter: character.life === 0 ? "grayscale(100%)" : "none",
							}}
						/>
						{effect === "explosion" && (
							<div className="absolute inset-0 flex justify-center items-center">
								<Image
									width={120}
									height={120}
									src="/effect/explosion.gif"
									alt="Explosion Effect"
									objectFit="cover"
								/>
							</div>
						)}

						{effect === "heal" && (
							<div className="absolute inset-0 flex justify-center items-center">
								<Image
									width={120}
									height={120}
									src="/effect/heart.gif"
									alt="Heal Effect"
									objectFit="cover"
								/>
							</div>
						)}
					</motion.div>
				</div>
				<div className="w-[200px] text-green-400 flex justify-center items-center">
					<span className="text-lg">{character.character.name}</span>
				</div>
				<div className="w-[200px] flex flex-col justify-center items-center text-center">
					<div className="w-[150px] bg-gray-800 rounded-full h-2">
						<div
							className={`${hpColor} h-2 rounded-full transition-all duration-500`}
							style={{ width: `${hpPercentage}%` }}
						></div>
					</div>
					<div className="flex justify-center items-end gap-3 w-full">
						<span className="text-xs mt-1">HP {character.life}</span>
						<span className="text-xs">パワー{character.power}</span>
					</div>
					<div className="flex justify-center gap-3 w-full">
						<span className="text-xs">スピード {character.speed}</span>
						<span className="text-xs">回避率 {character.evasion}%</span>
					</div>
				</div>
			</div>
		);
	},
	(prevProps, nextProps) => {
		return (
			prevProps.character === nextProps.character &&
			prevProps.isSelected === nextProps.isSelected &&
			prevProps.isEnemy === nextProps.isEnemy &&
			prevProps.isActive === nextProps.isActive &&
			prevProps.effect === nextProps.effect
		);
	},
);

CharacterDisplay.displayName = "CharacterDisplay";

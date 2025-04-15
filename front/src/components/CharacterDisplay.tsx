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
		blockCount = 0,
	}: {
		character: RoomCharacter;
		isSelected?: boolean;
		isEnemy: boolean;
		isActive?: boolean;
		effect?: "blink" | "explosion" | "heal" | string;
		onClick: () => void;
		blockCount?: number;
	}) => {
		const hpPercentage = (character.life / character.maxLife) * 100;
		let hpColor = "bg-green-500";
		if (hpPercentage < 30) {
			hpColor = "bg-red-500";
		} else if (hpPercentage < 70) {
			hpColor = "bg-yellow-500";
		}

		const auraColor = isEnemy
			? "shadow-[0_0_15px_5px_rgba(239,68,68,0.5)]" // 赤系 (enemy)
			: "shadow-[0_0_15px_5px_rgba(34,197,94,0.5)]"; // 緑系 (味方とか)

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

		// Shield color based on enemy or ally
		const shieldColor = isEnemy
			? "rgba(239, 68, 68, 0.7)"
			: // Enemy red
				"rgba(34, 197, 94, 0.7)"; // Ally green

		// Shield glow color
		const shieldGlowColor = isEnemy
			? "0 0 15px 5px rgba(239, 68, 68, 0.5)"
			: // Enemy red glow
				"0 0 15px 5px rgba(34, 197, 94, 0.5)"; // Ally green glow

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
						{/* Advanced Shield Effect */}
						{blockCount > 0 && (
							<>
								{/* Completely new shield effect */}
								<motion.div
									className="absolute inset-0 z-10"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.5 }}
								>
									{/* Digital barrier with glitch effect */}
									<motion.div
										className="absolute inset-0 overflow-hidden"
										style={{
											borderRadius: "10px",
											background: "transparent",
										}}
									>
										{/* Main shield barrier - digital wall */}
										<motion.div
											className="absolute inset-0"
											style={{
												background: isEnemy
													? "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.2) 100%)"
													: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.2) 100%)",
												backdropFilter: "blur(2px)",
												border: isEnemy
													? "1px solid rgba(239, 68, 68, 0.5)"
													: "1px solid rgba(34, 197, 94, 0.5)",
												boxShadow: isEnemy
													? "inset 0 0 20px rgba(239, 68, 68, 0.3)"
													: "inset 0 0 20px rgba(34, 197, 94, 0.3)",
											}}
										/>

										{/* Digital scan lines */}
										<motion.div
											className="absolute inset-0"
											style={{
												background: isEnemy
													? `repeating-linear-gradient(
                              0deg,
                              transparent,
                              transparent 2px,
                              rgba(239, 68, 68, 0.1) 2px,
                              rgba(239, 68, 68, 0.1) 4px
                            )`
													: `repeating-linear-gradient(
                              0deg,
                              transparent,
                              transparent 2px,
                              rgba(34, 197, 94, 0.1) 2px,
                              rgba(34, 197, 94, 0.1) 4px
                            )`,
											}}
											animate={{
												backgroundPosition: ["0px 0px", "0px 100px"],
											}}
											transition={{
												duration: 10,
												repeat: Number.POSITIVE_INFINITY,
												ease: "linear",
											}}
										/>

										{/* Random glitch blocks */}
										{[...Array(8)].map((_, i) => (
											<motion.div
												key={`glitch-${i}`}
												className="absolute"
												style={{
													width: 10 + Math.random() * 30,
													height: 2 + Math.random() * 10,
													background: isEnemy
														? `rgba(239, 68, 68, ${0.3 + Math.random() * 0.5})`
														: `rgba(34, 197, 94, ${0.3 + Math.random() * 0.5})`,
													left: `${Math.random() * 100}%`,
													top: `${Math.random() * 100}%`,
												}}
												animate={{
													opacity: [0, 1, 1, 0],
													x: [0, Math.random() * 10 - 5],
													scaleX: [1, 1.5, 0.5, 1],
												}}
												transition={{
													duration: 0.2 + Math.random() * 0.3,
													repeat: Number.POSITIVE_INFINITY,
													repeatDelay: 1 + Math.random() * 3,
													ease: "easeInOut",
												}}
											/>
										))}

										{/* Digital circuit patterns */}
										<motion.div
											className="absolute inset-0"
											style={{
												background: isEnemy
													? `radial-gradient(circle at ${
															Math.random() * 100
														}% ${Math.random() * 100}%, rgba(239, 68, 68, 0.5) 0%, transparent 10%),
                             radial-gradient(circle at ${
																Math.random() * 100
															}% ${Math.random() * 100}%, rgba(239, 68, 68, 0.5) 0%, transparent 5%),
                             radial-gradient(circle at ${
																Math.random() * 100
															}% ${
																Math.random() * 100
															}%, rgba(239, 68, 68, 0.5) 0%, transparent 15%)`
													: `radial-gradient(circle at ${
															Math.random() * 100
														}% ${Math.random() * 100}%, rgba(34, 197, 94, 0.5) 0%, transparent 10%),
                             radial-gradient(circle at ${
																Math.random() * 100
															}% ${Math.random() * 100}%, rgba(34, 197, 94, 0.5) 0%, transparent 5%),
                             radial-gradient(circle at ${
																Math.random() * 100
															}% ${
																Math.random() * 100
															}%, rgba(34, 197, 94, 0.5) 0%, transparent 15%)`,
											}}
											animate={{
												opacity: [0.3, 0.7, 0.3],
											}}
											transition={{
												duration: 3,
												repeat: Number.POSITIVE_INFINITY,
												ease: "easeInOut",
											}}
										/>
									</motion.div>

									{/* Lightning/energy arcs */}
									{[...Array(4)].map((_, i) => (
										<motion.div
											key={`arc-${i}`}
											className="absolute"
											style={{
												width: 2,
												height: 40 + Math.random() * 60,
												background: isEnemy
													? "linear-gradient(to bottom, rgba(239, 68, 68, 0.8), transparent)"
													: "linear-gradient(to bottom, rgba(34, 197, 94, 0.8), transparent)",
												borderRadius: "50%",
												transformOrigin: "top center",
												left: `${10 + i * 25 + Math.random() * 10}%`,
												top: "-10%",
												filter: "blur(1px)",
												zIndex: 5,
											}}
											animate={{
												rotate: [
													-10 + Math.random() * 20,
													10 + Math.random() * 20,
													-5 + Math.random() * 10,
												],
												scaleY: [0.7, 1.2, 0.7],
												opacity: [0.5, 0.8, 0.5],
											}}
											transition={{
												duration: 2 + Math.random(),
												repeat: Number.POSITIVE_INFINITY,
												ease: "easeInOut",
											}}
										/>
									))}

									{/* Floating data symbols */}
									{[...Array(10)].map((_, i) => {
										const symbols = [
											"0",
											"1",
											"×",
											"○",
											"□",
											"△",
											"▽",
											"◇",
											"▷",
											"◁",
										];
										return (
											<motion.div
												key={`symbol-${i}`}
												className="absolute text-xs font-mono"
												style={{
													color: isEnemy
														? "rgba(239, 68, 68, 0.8)"
														: "rgba(34, 197, 94, 0.8)",
													left: `${Math.random() * 100}%`,
													top: `${Math.random() * 100}%`,
													textShadow: isEnemy
														? "0 0 5px rgba(239, 68, 68, 0.8)"
														: "0 0 5px rgba(34, 197, 94, 0.8)",
												}}
												animate={{
													y: [0, -20],
													opacity: [0, 1, 0],
												}}
												transition={{
													duration: 2 + Math.random() * 2,
													repeat: Number.POSITIVE_INFINITY,
													delay: Math.random() * 5,
													ease: "easeInOut",
												}}
											>
												{symbols[Math.floor(Math.random() * symbols.length)]}
											</motion.div>
										);
									})}

									{/* Shield count display - futuristic counter */}
									<div className="absolute top-0 right-0 z-20">
										<motion.div
											className={`flex items-center justify-center w-10 h-10 ${
												isEnemy ? "bg-red-900/70" : "bg-green-900/70"
											} backdrop-blur-sm rounded-full border-2 ${
												isEnemy ? "border-red-500" : "border-green-500"
											}`}
											style={{
												boxShadow: isEnemy
													? "0 0 10px rgba(239, 68, 68, 0.8)"
													: "0 0 10px rgba(34, 197, 94, 0.8)",
											}}
											animate={{
												scale: [1, 1.05, 1],
												boxShadow: isEnemy
													? [
															"0 0 5px rgba(239, 68, 68, 0.5)",
															"0 0 15px rgba(239, 68, 68, 0.8)",
															"0 0 5px rgba(239, 68, 68, 0.5)",
														]
													: [
															"0 0 5px rgba(34, 197, 94, 0.5)",
															"0 0 15px rgba(34, 197, 94, 0.8)",
															"0 0 5px rgba(34, 197, 94, 0.5)",
														],
											}}
											transition={{
												duration: 2,
												repeat: Number.POSITIVE_INFINITY,
												ease: "easeInOut",
											}}
										>
											<div className="relative">
												{/* Digital number effect */}
												<div className="absolute inset-0 flex items-center justify-center">
													<div
														className={`text-lg font-bold ${
															isEnemy ? "text-red-300" : "text-green-300"
														} opacity-50`}
														style={{
															textShadow: isEnemy
																? "0 0 5px rgba(239, 68, 68, 1)"
																: "0 0 5px rgba(34, 197, 94, 1)",
														}}
													>
														{blockCount}
													</div>
												</div>
												<div
													className={`text-lg font-bold ${
														isEnemy ? "text-red-300" : "text-green-300"
													}`}
													style={{
														textShadow: isEnemy
															? "0 0 5px rgba(239, 68, 68, 1)"
															: "0 0 5px rgba(34, 197, 94, 1)",
													}}
												>
													{blockCount}
												</div>
											</div>
										</motion.div>
									</div>

									{/* Edge highlight effect */}
									<motion.div
										className="absolute inset-0"
										style={{
											border: isEnemy
												? "2px solid rgba(239, 68, 68, 0.5)"
												: "2px solid rgba(34, 197, 94, 0.5)",
											borderRadius: "10px",
											boxShadow: isEnemy
												? "0 0 10px rgba(239, 68, 68, 0.5)"
												: "0 0 10px rgba(34, 197, 94, 0.5)",
										}}
										animate={{
											opacity: [0.5, 1, 0.5],
										}}
										transition={{
											duration: 2,
											repeat: Number.POSITIVE_INFINITY,
											ease: "easeInOut",
										}}
									/>
								</motion.div>
							</>
						)}

						{character.isErrorMode ? (
							<Image
								src={
									characterToImagePath(`${character.character.id}-error`) ||
									"/placeholder.svg" ||
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
						) : (
							<Image
								src={
									characterToImagePath(character.character.id) ||
									"/placeholder.svg" ||
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
						)}

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
						{blockCount > 0 && (
							<span
								className={`text-xs font-bold ${
									isEnemy ? "text-red-300" : "text-cyan-300"
								}`}
							>
								シールド {blockCount}
							</span>
						)}
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
			prevProps.effect === nextProps.effect &&
			prevProps.blockCount === nextProps.blockCount
		);
	},
);

CharacterDisplay.displayName = "CharacterDisplay";

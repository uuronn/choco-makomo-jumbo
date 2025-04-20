"use client";

import type { RoomCharacter } from "~/type/room";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { characterToImagePath } from "~/lib/utils";

export const CharacterDisplay = React.memo(
	({
		character,
		isEnemy,
		isActive,
		effect,
		onClick,
		blockCount = 0,
		isErrorMode = false,
	}: {
		character: RoomCharacter;
		isSelected?: boolean;
		isEnemy: boolean;
		isActive?: boolean;
		effect?: "blink" | "explosion" | "heal" | "error-glitch" | string;
		onClick: () => void;
		blockCount?: number;
		isErrorMode?: boolean;
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

		// Error glitch animation variants
		const errorGlitchVariants = {
			glitch: {
				x: [0, -0.8, 0.8, -0.6, 0.6, 0, 0.4, -0.4, 0],
				y: [0, 0.6, -0.6, 0.4, -0.4, 0.3, -0.3, 0],
				rotate: [0, -0.1, 0.1, -0.08, 0.08, 0],
				scale: [1, 1.002, 0.998, 1.0015, 0.9985, 1],
				transition: {
					duration: 0.5,
					repeat: Number.POSITIVE_INFINITY,
					repeatType: "loop" as const,
					ease: "easeInOut",
				},
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

		// エラーモードに遅延を追加するための状態
		const [delayedErrorMode, setDelayedErrorMode] = useState(false);

		// Determine if we should show error mode
		const showErrorMode =
			isErrorMode || effect === "error-glitch" || character.isErrorMode;

		// エラーモードが変更されたときに遅延を適用
		useEffect(() => {
			if (showErrorMode) {
				// エラーモードになるまで2秒待つ
				const timer = setTimeout(() => {
					setDelayedErrorMode(true);
				}, 2000); // 2秒の遅延

				return () => {
					clearTimeout(timer);
				};
			} else {
				setDelayedErrorMode(false);
			}
		}, [showErrorMode]);

		// 実際に表示するエラーモード（遅延適用後）
		const displayErrorMode = delayedErrorMode;

		const prevBlockCountRef = useRef(blockCount);
		const [isBreaking, setIsBreaking] = useState(false);
		const [isFinalBreak, setIsFinalBreak] = useState(false);
		const containerRef = useRef<HTMLDivElement>(null);

		// Detect shield break (when blockCount decreases)
		useEffect(() => {
			if (
				prevBlockCountRef.current > blockCount &&
				prevBlockCountRef.current > 0
			) {
				// Shield was broken or reduced
				const willBeFinalBreak =
					prevBlockCountRef.current === 1 && blockCount === 0;

				// Apply screen shake to the parent when shield breaks
				if (containerRef.current) {
					// More intense shake if it's the final shield
					if (willBeFinalBreak) {
						containerRef.current.animate(
							[
								{ transform: "translate(0, 0)" },
								{ transform: "translate(-15px, 12px)" },
								{ transform: "translate(18px, -10px)" },
								{ transform: "translate(-18px, -12px)" },
								{ transform: "translate(15px, 15px)" },
								{ transform: "translate(-12px, -18px)" },
								{ transform: "translate(10px, 12px)" },
								{ transform: "translate(-6px, -10px)" },
								{ transform: "translate(0, 0)" },
							],
							{
								duration: 800,
								easing: "ease-in-out",
							},
						);
					} else {
						containerRef.current.animate(
							[
								{ transform: "translate(0, 0)" },
								{ transform: "translate(-8px, 6px)" },
								{ transform: "translate(10px, -4px)" },
								{ transform: "translate(-10px, -5px)" },
								{ transform: "translate(8px, 8px)" },
								{ transform: "translate(-4px, -8px)" },
								{ transform: "translate(0, 0)" },
							],
							{
								duration: 500,
								easing: "ease-in-out",
							},
						);
					}
				}

				// 破壊エフェクトをトリガー
				setIsFinalBreak(willBeFinalBreak);
				setIsBreaking(true);

				// Reset the effect after animation completes - longer for final break
				const timer = setTimeout(
					() => {
						setIsBreaking(false);
						setIsFinalBreak(false);
					},
					willBeFinalBreak ? 2500 : 1500,
				);

				return () => clearTimeout(timer);
			}

			// Update the ref with current value for next comparison
			prevBlockCountRef.current = blockCount;
		}, [blockCount]);

		return (
			<div
				className={`flex flex-col items-center rounded-lg transition-all`}
				onClick={onClick}
				ref={containerRef}
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
								character.life > 0 && !effect && !showErrorMode
									? `float 3s ease-in-out infinite`
									: "none",
						}}
						// Apply the blink animation when effect is "blink"
						animate={
							effect === "blink" ? "blink" : showErrorMode ? "glitch" : "idle"
						}
						variants={showErrorMode ? errorGlitchVariants : blinkVariants}
					>
						{/* Advanced Shield Effect */}
						{blockCount > 0 && (
							<>
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
								</motion.div>
							</>
						)}

						{/* Shield Break Effect - Completely separate from the shield itself */}
						<AnimatePresence>
							{isBreaking && (
								<motion.div
									className="absolute inset-0 z-30 pointer-events-none"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
								>
									{/* 強化された閃光効果 - より明るく、より大きく */}
									<motion.div
										className="absolute inset-0"
										style={{
											background: isEnemy
												? "radial-gradient(circle at center, rgba(255, 255, 255, 0.95) 0%, rgba(239, 68, 68, 0.9) 30%, transparent 70%)"
												: "radial-gradient(circle at center, rgba(255, 255, 255, 0.95) 0%, rgba(34, 197, 94, 0.9) 30%, transparent 70%)",
										}}
										animate={{
											opacity: [0, 1, 0],
											scale: [0.2, 1.8, 2.5],
										}}
										transition={{
											duration: 0.7,
											ease: "easeOut",
										}}
									/>

									{/* Final shield break special effect (1 to 0) */}
									{isFinalBreak && (
										<>
											{/* Massive explosion effect for final shield break */}
											<motion.div
												className="absolute inset-0 z-31"
												style={{
													background: isEnemy
														? "radial-gradient(circle at center, rgba(255, 255, 255, 1) 0%, rgba(239, 68, 68, 1) 20%, rgba(239, 68, 68, 0.8) 40%, transparent 80%)"
														: "radial-gradient(circle at center, rgba(255, 255, 255, 1) 0%, rgba(34, 197, 94, 1) 20%, rgba(34, 197, 94, 0.8) 40%, transparent 80%)",
												}}
												animate={{
													opacity: [0, 1, 0.8, 0],
													scale: [0.2, 2, 3],
												}}
												transition={{
													duration: 1.5,
													ease: "easeOut",
												}}
											/>

											{/* Secondary explosion rings - より多く、より大きく */}
											{[...Array(5)].map((_, i) => (
												<motion.div
													key={`explosion-ring-${i}`}
													className="absolute inset-0 rounded-full"
													style={{
														border: isEnemy
															? `${3 + i}px solid rgba(239, 68, 68, ${
																	0.95 - i * 0.15
																})`
															: `${3 + i}px solid rgba(34, 197, 94, ${
																	0.95 - i * 0.15
																})`,
														boxShadow: isEnemy
															? `0 0 ${20 + i * 15}px rgba(239, 68, 68, ${
																	0.9 - i * 0.15
																})`
															: `0 0 ${20 + i * 15}px rgba(34, 197, 94, ${
																	0.9 - i * 0.15
																})`,
													}}
													animate={{
														scale: [0, 1 + i * 0.6, 2.5 + i * 1],
														opacity: [0, 0.9, 0],
													}}
													transition={{
														duration: 1.8 + i * 0.4,
														delay: i * 0.15,
														ease: "easeOut",
													}}
												/>
											))}

											{/* Extra particles for final break - more and larger */}
											{[...Array(80)].map((_, i) => {
												const size = 4 + Math.random() * 15;
												const angle = Math.random() * 360;
												const distance = 60 + Math.random() * 300;
												return (
													<motion.div
														key={`final-particle-${i}`}
														className="absolute top-1/2 left-1/2 rounded-full"
														style={{
															width: size,
															height: size,
															background: isEnemy
																? `rgba(239, 68, 68, ${
																		0.8 + Math.random() * 0.2
																	})`
																: `rgba(34, 197, 94, ${
																		0.8 + Math.random() * 0.2
																	})`,
															boxShadow: isEnemy
																? `0 0 ${
																		8 + Math.random() * 12
																	}px rgba(239, 68, 68, 0.95)`
																: `0 0 ${
																		8 + Math.random() * 12
																	}px rgba(34, 197, 94, 0.95)`,
															zIndex: 32,
														}}
														initial={{
															x: 0,
															y: 0,
															opacity: 1,
															scale: 1,
														}}
														animate={{
															x: Math.cos(angle * (Math.PI / 180)) * distance,
															y: Math.sin(angle * (Math.PI / 180)) * distance,
															opacity: [1, 0.8, 0],
															scale: [1, Math.random() * 1.5 + 2.5, 0.5],
															rotate: Math.random() * 720 - 360,
														}}
														transition={{
															duration: 2 + Math.random() * 1.5,
															delay: 0.05 + Math.random() * 0.3,
															ease: [0.1, 0.5, 0.2, 1], // Custom easing for more explosive movement
														}}
													/>
												);
											})}

											{/* Flash effect - より強く */}
											<motion.div
												className="absolute inset-0 z-40"
												style={{
													background: isEnemy
														? "rgba(255, 255, 255, 0.95)"
														: "rgba(255, 255, 255, 0.95)",
												}}
												animate={{
													opacity: [0, 0.95, 0],
												}}
												transition={{
													duration: 0.7,
													ease: "easeOut",
												}}
											/>

											{/* 衝撃波エフェクト - 新しい要素 */}
											<motion.div
												className="absolute inset-0 z-35"
												style={{
													background: "transparent",
													border: isEnemy
														? "8px solid rgba(239, 68, 68, 0.8)"
														: "8px solid rgba(34, 197, 94, 0.8)",
													borderRadius: "50%",
													boxShadow: isEnemy
														? "inset 0 0 30px rgba(239, 68, 68, 0.8), 0 0 30px rgba(239, 68, 68, 0.8)"
														: "inset 0 0 30px rgba(34, 197, 94, 0.8), 0 0 30px rgba(34, 197, 94, 0.8)",
												}}
												initial={{ scale: 0, opacity: 1 }}
												animate={{
													scale: [0, 2.5],
													opacity: [1, 0],
												}}
												transition={{
													duration: 1.2,
													ease: "easeOut",
												}}
											/>
										</>
									)}

									{/* Enhanced Fracture lines - ALWAYS SHOW THESE FOR ANY SHIELD BREAK */}
									{/* 亀裂線を増やし、より太く、より目立つように */}
									{[...Array(36)].map((_, i) => {
										const angle = i * (360 / 36) + Math.random() * 10;
										const length = 60 + Math.random() * 200;
										const thickness = 2 + Math.random() * 3.5; // より太く
										const delay = i * 0.015; // より速く広がる

										return (
											<motion.div
												key={`fracture-${i}`}
												className="absolute top-1/2 left-1/2"
												style={{
													width: thickness,
													height: length,
													background: isEnemy
														? `linear-gradient(to bottom, rgba(255, 255, 255, ${0.95}), rgba(239, 68, 68, ${0.95}), transparent)`
														: `linear-gradient(to bottom, rgba(255, 255, 255, ${0.95}), rgba(34, 197, 94, ${0.95}), transparent)`,
													transformOrigin: "top center",
													transform: `rotate(${angle}deg)`,
													boxShadow: isEnemy
														? "0 0 15px rgba(239, 68, 68, 0.95)"
														: "0 0 15px rgba(34, 197, 94, 0.95)",
													zIndex: 33,
												}}
												initial={{ opacity: 0, scaleY: 0 }}
												animate={{
													opacity: [0, 1, 0.8, 0],
													scaleY: [0, 1, 1],
													y: [0, length * 0.6, length],
												}}
												transition={{
													duration: 1.2,
													delay: delay,
													ease: [0.17, 0.67, 0.83, 0.67], // Elastic-like effect
												}}
											/>
										);
									})}

									{/* 亀裂の交差点に光る点を追加 - 新しい要素 */}
									{[...Array(15)].map((_, i) => {
										const size = 3 + Math.random() * 8;
										const posX = -50 + Math.random() * 100;
										const posY = -50 + Math.random() * 100;
										return (
											<motion.div
												key={`crack-point-${i}`}
												className="absolute top-1/2 left-1/2 rounded-full"
												style={{
													width: size,
													height: size,
													background: isEnemy
														? "rgba(255, 255, 255, 0.95)"
														: "rgba(255, 255, 255, 0.95)",
													boxShadow: isEnemy
														? `0 0 15px rgba(239, 68, 68, 0.95)`
														: `0 0 15px rgba(34, 197, 94, 0.95)`,
													transform: `translate(${posX}px, ${posY}px)`,
													zIndex: 34,
												}}
												animate={{
													opacity: [0, 1, 0],
													scale: [0.5, 1.5, 0.8],
												}}
												transition={{
													duration: 0.8,
													delay: 0.1 + Math.random() * 0.3,
													ease: "easeOut",
												}}
											/>
										);
									})}

									{/* Enhanced Shattered particles - ALWAYS SHOW THESE FOR ANY SHIELD BREAK */}
									{/* より多くの破片パーティクル、より大きく、より長く表示 */}
									{[...Array(60)].map((_, i) => {
										const size = 3 + Math.random() * 10;
										const angle = Math.random() * 360;
										const distance = 40 + Math.random() * 250;
										const shape =
											Math.random() > 0.7
												? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" // ダイヤモンド形
												: Math.random() > 0.5
													? "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" // 五角形
													: ""; // 円形

										return (
											<motion.div
												key={`particle-${i}`}
												className="absolute top-1/2 left-1/2"
												style={{
													width: size,
													height: size,
													background: isEnemy
														? `rgba(239, 68, 68, ${0.8 + Math.random() * 0.2})`
														: `rgba(34, 197, 94, ${0.8 + Math.random() * 0.2})`,
													boxShadow: isEnemy
														? "0 0 10px rgba(239, 68, 68, 0.95)"
														: "0 0 10px rgba(34, 197, 94, 0.95)",
													borderRadius: shape ? "0" : "50%",
													clipPath: shape,
													zIndex: 34,
												}}
												initial={{
													x: 0,
													y: 0,
													opacity: 1,
													scale: 1,
												}}
												animate={{
													x: Math.cos(angle * (Math.PI / 180)) * distance,
													y: Math.sin(angle * (Math.PI / 180)) * distance,
													opacity: [1, 0.8, 0],
													scale: [1, Math.random() * 0.8 + 1.8, 0.5],
													rotate: Math.random() * 360,
												}}
												transition={{
													duration: 1.5,
													delay: 0.05 + Math.random() * 0.2,
													ease: [0.19, 0.69, 0.01, 0.99], // Custom easing for more dynamic movement
												}}
											/>
										);
									})}

									{/* 破片の軌跡エフェクト - 新しい要素 */}
									{[...Array(20)].map((_, i) => {
										const angle = Math.random() * 360;
										const distance = 30 + Math.random() * 150;
										return (
											<motion.div
												key={`trail-${i}`}
												className="absolute top-1/2 left-1/2"
												style={{
													width: 2,
													height: 20 + Math.random() * 40,
													background: isEnemy
														? `linear-gradient(to bottom, rgba(239, 68, 68, 0.9), transparent)`
														: `linear-gradient(to bottom, rgba(34, 197, 94, 0.9), transparent)`,
													transformOrigin: "top center",
													transform: `rotate(${angle}deg)`,
													zIndex: 32,
												}}
												initial={{
													x: 0,
													y: 0,
													opacity: 0,
													scaleY: 0,
												}}
												animate={{
													x: Math.cos(angle * (Math.PI / 180)) * distance * 0.5,
													y: Math.sin(angle * (Math.PI / 180)) * distance * 0.5,
													opacity: [0, 0.8, 0],
													scaleY: [0, 1, 0.5],
												}}
												transition={{
													duration: 0.8,
													delay: 0.1 + Math.random() * 0.3,
													ease: "easeOut",
												}}
											/>
										);
									})}
								</motion.div>
							)}
						</AnimatePresence>

						{/* Error Mode Container */}
						{displayErrorMode ? (
							<Image
								src={
									characterToImagePath(
										`${character.character.id || "/placeholder.svg"}-error`,
									) ||
									characterToImagePath(character.character.id) ||
									"/placeholder.svg"
								}
								alt=""
								width={100}
								height={100}
								className={`object-cover rounded-xl ${auraColor}`}
								// style={{
								// 	filter: character.life === 0 ? "grayscale(100%)" : "none",
								// }}
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
								className={`object-cover rounded-xl ${auraColor}`}
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
			prevProps.blockCount === nextProps.blockCount &&
			prevProps.isErrorMode === nextProps.isErrorMode
		);
	},
);

CharacterDisplay.displayName = "CharacterDisplay";

"use client";

import { useEffect, useRef } from "react";

interface DigitalNoiseProps {
	isActive: boolean;
	intensity?: number; // 0-1
	color?: string;
}

export default function DigitalNoise({
	isActive,
	intensity = 0.5,
	color = "rgba(255, 0, 0, 0.15)",
}: DigitalNoiseProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const requestRef = useRef<number>();

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Set canvas size to match window
		const resizeCanvas = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);

		// Animation function
		const animate = () => {
			if (!isActive) {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				return;
			}

			// Clear canvas
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Draw noise
			const imageData = ctx.createImageData(canvas.width, canvas.height);
			const data = imageData.data;

			for (let i = 0; i < data.length; i += 4) {
				// Only draw some pixels for performance
				if (Math.random() > 0.97) {
					const noise = Math.random() * 255 * intensity;

					// Parse the color
					const div = document.createElement("div");
					div.style.color = color;
					document.body.appendChild(div);
					const computedColor = window.getComputedStyle(div).color;
					document.body.removeChild(div);

					// Extract RGB values
					const rgbMatch = computedColor.match(/\d+/g);
					if (rgbMatch && rgbMatch.length >= 3) {
						const r = Number.parseInt(rgbMatch[0]);
						const g = Number.parseInt(rgbMatch[1]);
						const b = Number.parseInt(rgbMatch[2]);
						const a =
							rgbMatch.length > 3 ? Number.parseInt(rgbMatch[3]) / 255 : 1;

						data[i] = r;
						data[i + 1] = g;
						data[i + 2] = b;
						data[i + 3] = noise * a;
					} else {
						// Fallback to red
						data[i] = 255;
						data[i + 1] = 0;
						data[i + 2] = 0;
						data[i + 3] = noise;
					}
				}
			}

			ctx.putImageData(imageData, 0, 0);
			requestRef.current = requestAnimationFrame(animate);
		};

		// Start animation
		requestRef.current = requestAnimationFrame(animate);

		// Cleanup
		return () => {
			window.removeEventListener("resize", resizeCanvas);
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
			}
		};
	}, [isActive, intensity, color]);

	if (!isActive) return null;

	return (
		<canvas
			ref={canvasRef}
			className="fixed inset-0 pointer-events-none z-40"
			style={{ opacity: intensity }}
		/>
	);
}

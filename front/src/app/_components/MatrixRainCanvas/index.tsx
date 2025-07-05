"use client";

import { useEffect, useRef } from "react";

export const MatrixRainCanvas = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const fontSize = 14;
		const chars = "01";
		const setCanvasSize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		setCanvasSize();
		window.addEventListener("resize", setCanvasSize);

		const columns = Math.floor(canvas.width / fontSize);
		const drops = Array.from({ length: columns }, () =>
			Math.floor(Math.random() * -canvas.height),
		);

		const draw = () => {
			ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.font = `${fontSize}px monospace`;

			for (let i = 0; i < drops.length; i++) {
				const char = chars[Math.floor(Math.random() * chars.length)];
				const x = i * fontSize;
				const y = drops[i] * fontSize;
				const opacity = Math.random() * 0.5 + 0.5;
				ctx.fillStyle = `rgba(16, 185, 129, ${opacity})`;
				ctx.fillText(char, x, y);

				drops[i]++;
				if (y > canvas.height && Math.random() > 0.975) {
					drops[i] = Math.floor(Math.random() * -20);
				}
			}

			requestAnimationFrame(draw);
		};

		const id = requestAnimationFrame(draw);
		return () => {
			cancelAnimationFrame(id);
			window.removeEventListener("resize", setCanvasSize);
		};
	}, []);

	return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
};

"use client";

import { useState, useEffect, useRef } from "react";
import { LucideShieldAlert } from "lucide-react";
import { Button } from "~/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { useUserContext } from "~/context/UserProvider";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { handleSignIn } = useUserContext();

  // Canvas Matrix Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasDimensions();
    window.addEventListener("resize", setCanvasDimensions);

    // Matrix rain effect
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];

    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -canvas.height);
    }

    // Characters to display
    const chars = "01";

    // Animation loop
    const draw = () => {
      // Semi-transparent black to create fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#10b981"; // Emerald green
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = chars[Math.floor(Math.random() * chars.length)];

        // Position and draw the character
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Vary the opacity based on position for a more dynamic look
        const opacity = Math.random() * 0.5 + 0.5;
        ctx.fillStyle = `rgba(16, 185, 129, ${opacity})`;

        ctx.fillText(text, x, y);

        // Move drops down
        drops[i]++;

        // Reset drops when they reach bottom or randomly
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = Math.floor(Math.random() * -20);
        }
      }

      requestAnimationFrame(draw);
    };

    const animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", setCanvasDimensions);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Google Authentication
  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      <div className="absolute inset-0 bg-gradient-radial from-transparent to-black opacity-70"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="p-8 rounded-lg border border-emerald-500/50 bg-black/60 backdrop-blur-md shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-pulse-slow">
          <div className="mb-8 text-center relative">
            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <h1 className="text-5xl font-bold tracking-wider text-emerald-500 mb-2 font-mono relative">
              技術大戦争
              <span className="absolute -inset-1 bg-emerald-500/20 blur-sm rounded-lg -z-10"></span>
            </h1>
            <p className="text-emerald-300/80 text-sm tracking-[0.5em] mt-2">
              TECHNOLOGY WAR
            </p>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            {error && (
              <div className="p-3 rounded-md bg-red-500/20 border border-red-500/50 flex items-center gap-2 text-sm animate-pulse">
                <LucideShieldAlert className="h-4 w-4 text-red-500" />
                <span className="text-red-200">{error}</span>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-emerald-500/30"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-2 text-emerald-400">
                  Access Terminal
                </span>
              </div>
            </div>

            <Button
              onClick={handleSignIn}
              variant="outline"
              className="w-full h-12 flex items-center justify-center gap-2 border-2 hover:bg-purple-50 transition-colors"
            >
              <FcGoogle className="h-5 w-5" />
              <span>Googleでログイン</span>
            </Button>

            <div className="text-center text-xs text-emerald-400/60 mt-6">
              <p className="relative inline-block">
                <span className="absolute -inset-1 bg-emerald-500/10 blur-sm rounded-lg -z-10"></span>
                login with google
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-emerald-300/60 text-xs">
              技術大戦争 | TECHNOLOGY WAR
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

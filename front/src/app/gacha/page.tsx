"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Sparkles, Terminal, Cpu, Zap, ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { useAuth } from "../context/AuthProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function GachaScreen() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<gachaResult | null>(null);
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      speed: number;
      color: string;
    }>
  >([]);

  const { user } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (isAnimating) {
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        speed: Math.random() * 2 + 1,
        color: ["#00ff9d", "#00f0ff", "#00c3ff", "#00ff66"][
          Math.floor(Math.random() * 4)
        ],
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isAnimating]);

  const pullGacha = async () => {
    try {
      if (!user) return;

      setIsAnimating(true);
      setShowResult(false);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${user.uid}/gacha`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        throw new Error("ガチャの取得に失敗しました");
      }

      const data = await res.json();
      const selectedRarity = data.rarity;
      setResult(data);

      setIsAnimating(false);
      setShowResult(true);
    } catch (error) {
      console.error("ガチャの取得に失敗しました", error);
    }
  };

  const rarityColors = {
    1: "from-green-400 to-green-600",
    2: "from-blue-400 to-blue-600",
    3: "from-purple-400 to-purple-600",
    4: "from-yellow-400 to-yellow-600",
    5: "from-red-400 to-red-600",
    6: "from-pink-400 to-pink-600",
  };

  const rarityText = {
    1: "⭐️",
    2: "⭐️⭐️",
    3: "⭐️⭐️⭐️",
    4: "⭐️⭐️⭐️⭐️",
    5: "⭐️⭐️⭐️⭐️⭐️",
    6: "⭐️⭐️⭐️⭐️⭐️⭐️",
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2MmgtMnYtMnptLTQgMHYyaC0ydi0yaDJ6bTIgMGgydjJoLTJ2LTJ6bS02IDBoMnYyaC0ydi0yem0yLTRoMnYyaC0ydi0yem0yIDBIMzZ2Mmgtc3YtMnptMCA0aDJ2MmgtMnYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')]"></div>

      {/* Animated circuit lines */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse"></div>
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-green-500 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse"></div>
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-green-500 to-transparent animate-pulse"></div>
      </div>

      {/* Binary code background effect */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="font-mono text-xs text-green-500 whitespace-nowrap animate-scrollUp">
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} className="my-2">
              {Array.from({ length: 120 })
                .map((_, j) => (Math.random() > 0.5 ? "1" : "0"))
                .join("")}
            </div>
          ))}
        </div>
      </div>

      <div className="py-3 gap-0 w-full h-full max-w-md bg-black/80 backdrop-blur-sm rounded-xl shadow-[0_0_15px_rgba(0,255,128,0.3)] border border-green-500/30 overflow-hidden relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-900/80 to-green-700/80 p-4 text-center relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-green-300 to-green-400"></div>

          <div className="flex items-center justify-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <Cpu className="h-6 w-6 text-green-300" />
            </motion.div>

            <h1 className="text-2xl font-bold text-green-300 tracking-wider">
              技術大戦争
            </h1>

            <motion.div
              animate={{ rotate: -360 }}
              transition={{
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <Terminal className="h-6 w-6 text-green-300" />
            </motion.div>
          </div>

          <p className="text-green-400 mt-1 text-sm tracking-widest uppercase">
            PROGRAMMING LANGUAGE SYSTEM
          </p>

          {/* Tech decorations */}
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-black/50 rounded-t-full border-t border-l border-r border-green-500/30"></div>
        </div>

        <div className="p-6 flex flex-col items-center relative">
          {/* Digital counter */}
          <div className="absolute top-2 right-2 font-mono text-xs text-green-500 bg-black/50 px-2 py-1 rounded border border-green-500/30">
            SYS:READY_
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            >
              |
            </motion.span>
          </div>

          <div className="relative w-64 h-64 mb-6 flex items-center justify-center">
            {/* Particle effects */}
            {isAnimating &&
              particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="absolute rounded-full"
                  initial={{
                    x: `calc(50% - ${particle.size / 2}px)`,
                    y: `calc(50% - ${particle.size / 2}px)`,
                    opacity: 1,
                  }}
                  animate={{
                    x: `calc(${particle.x}% - ${particle.size / 2}px)`,
                    y: `calc(${particle.y}% - ${particle.size / 2}px)`,
                    opacity: 0,
                  }}
                  transition={{ duration: particle.speed, ease: "easeOut" }}
                  style={{
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    backgroundColor: particle.color,
                    boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                  }}
                />
              ))}

            <AnimatePresence>
              {!showResult ? (
                <div className="relative">
                  <motion.div
                    className="w-48 h-48 rounded-full bg-black flex items-center justify-center relative"
                    initial={{ boxShadow: "0 0 0px rgba(0,255,128,0.3)" }}
                    animate={{
                      boxShadow: isAnimating
                        ? "0 0 30px rgba(0,255,128,0.6)"
                        : "0 0 15px rgba(0,255,128,0.3)",
                    }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    }}
                  >
                    <div className="absolute inset-0 rounded-full border-4 border-green-500/30"></div>
                    <div className="absolute inset-2 rounded-full border border-green-500/20"></div>

                    {/* Rotating rings */}
                    {isAnimating && (
                      <>
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-green-400/30 border-dashed"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 8,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                          }}
                        ></motion.div>
                        <motion.div
                          className="absolute inset-4 rounded-full border border-green-400/20 border-dashed"
                          animate={{ rotate: -360 }}
                          transition={{
                            duration: 12,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                          }}
                        ></motion.div>
                      </>
                    )}

                    <div className="w-32 h-32 rounded-full bg-black border border-green-500/50 flex items-center justify-center relative overflow-hidden">
                      {/* Scan line effect */}
                      {isAnimating && (
                        <motion.div
                          className="absolute w-full h-8 bg-green-500/10"
                          initial={{ top: -30 }}
                          animate={{ top: ["100%", "-20%"] }}
                          transition={{
                            duration: 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                          }}
                        ></motion.div>
                      )}

                      {isAnimating ? (
                        <motion.div
                          animate={{
                            rotate: 360,
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            rotate: {
                              duration: 2,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "linear",
                            },
                            scale: {
                              duration: 1.5,
                              repeat: Number.POSITIVE_INFINITY,
                            },
                          }}
                        >
                          <Zap className="h-12 w-12 text-green-400 drop-shadow-[0_0_8px_rgba(0,255,128,0.8)]" />
                        </motion.div>
                      ) : (
                        <Code2 className="h-12 w-12 text-green-500" />
                      )}
                    </div>
                  </motion.div>

                  {/* Code symbols */}
                  <motion.div
                    className="absolute -top-4 -right-4 text-green-400 font-mono text-xl"
                    animate={
                      isAnimating
                        ? { y: [0, -10, 0], opacity: [1, 0.5, 1] }
                        : {}
                    }
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  >
                    {"</>"}
                  </motion.div>
                  <motion.div
                    className="absolute -bottom-4 -left-4 text-green-400 font-mono text-xl"
                    animate={
                      isAnimating ? { y: [0, 10, 0], opacity: [1, 0.5, 1] } : {}
                    }
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: 0.5,
                    }}
                  >
                    {"{}"}
                  </motion.div>
                </div>
              ) : (
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className={`w-full h-full  bg-gradient-to-br ${rarityColors[result?.rarity as keyof typeof rarityColors]} p-6 rounded-xl border-2 border-green-400/50 shadow-[0_0_20px_rgba(0,255,128,0.4)]`}
                >
                  <div className="text-center">
                    <div className="mb-2 px-3 py-1 bg-black/30 rounded-full inline-block">
                      <p className="text-xs font-mono text-white tracking-widest">
                        {rarityText[result?.rarity as keyof typeof rarityText]}
                      </p>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1">
                      {result?.name}
                    </h3>
                    {result?.image_url && (
                      <Image
                        alt=""
                        height={200}
                        width={200}
                        src={result.image_url}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-full flex items-center gap-3 justify-center">
            <Button
              onClick={() => {
                router.push("/");
              }}
              disabled={isAnimating}
              className=" w-1/2 relative bg-black hover:bg-green-900 text-green-400 border border-green-500/50 px-8 py-6 text-xl rounded-md shadow-[0_0_10px_rgba(0,255,128,0.3)] transition-all hover:shadow-[0_0_15px_rgba(0,255,128,0.5)] disabled:opacity-70 disabled:hover:shadow-[0_0_10px_rgba(0,255,128,0.3)] overflow-hidden group"
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              {/* Button text with scan line */}
              <div className="relative">
                <span className="tracking-wider font-mono">戻る</span>
                <motion.div
                  className="absolute inset-0 bg-green-400/20 mix-blend-overlay"
                  animate={{ top: ["100%", "-100%"] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                ></motion.div>
              </div>
            </Button>
            <Button
              onClick={pullGacha}
              disabled={isAnimating}
              className="w-1/2 relative bg-black hover:bg-green-900 text-green-400 border border-green-500/50 px-8 py-6 text-xl rounded-md shadow-[0_0_10px_rgba(0,255,128,0.3)] transition-all hover:shadow-[0_0_15px_rgba(0,255,128,0.5)] disabled:opacity-70 disabled:hover:shadow-[0_0_10px_rgba(0,255,128,0.3)] overflow-hidden group"
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              {/* Button text with scan line */}
              <div className="relative">
                <span className="tracking-wider font-mono">ガチャを引く</span>
                <motion.div
                  className="absolute inset-0 bg-green-400/20 mix-blend-overlay"
                  animate={{ top: ["100%", "-100%"] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                ></motion.div>
              </div>
            </Button>
          </div>

          <div className="mt-6 text-xs text-green-500/70 font-mono flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>SYSTEM READY FOR LANGUAGE EXTRACTION</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Tech decorations around the card */}
      <div className="absolute bottom-4 left-4 text-green-500/30 font-mono text-xs">
        <div>SYS:ONLINE</div>
        <div>VER:2.5.7</div>
      </div>

      <div className="absolute top-4 right-4 text-green-500/30 font-mono text-xs">
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-green-500 rounded-full"></div>
          <span>NETWORK:ACTIVE</span>
        </div>
      </div>

      {/* Add global styles for animations */}
      <style jsx global>{`
        @keyframes scrollUp {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        .animate-scrollUp {
          animation: scrollUp 60s linear infinite;
        }
      `}</style>
    </div>
  );
}

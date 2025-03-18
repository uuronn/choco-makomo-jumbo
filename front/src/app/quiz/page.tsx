"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, User } from "lucide-react";
import { BiQuestionMark } from "react-icons/bi";
import { enqueueSnackbar } from "notistack";
import { useUserContext } from "~/context/UserProvider";
import { quizData } from "~/const/quiz";
import { shuffle } from "lodash";

export default function CyberQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
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

  const { user } = useUserContext();

  const [shuffledQuizData, setShuffledQuizData] = useState(quizData);

  useEffect(() => {
    // quizDataをシャッフルして状態に設定
    setShuffledQuizData(shuffle(quizData));
  }, []);

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

      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 10);

      return () => clearTimeout(timer);
    } else {
      setParticles([]);
    }
  }, [isAnimating]);

  const handleSelectAnswer = (answer: string) => {
    // Disable buttons immediately
    setButtonsDisabled(true);

    // Check if the answer is correct
    const isCorrect =
      answer === shuffledQuizData[currentQuestion].correctAnswer;

    // Show appropriate alert
    if (isCorrect) {
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${user?.uid}/point`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            point: 2,
          }),
        },
      );
      enqueueSnackbar("正解！ 2 ポイントGET", {
        variant: "success",
      });
    } else {
      enqueueSnackbar("不正解！", {
        variant: "error",
      });
    }

    // Trigger animation
    setIsAnimating(true);

    // Move to next question after a short delay
    setTimeout(() => {
      // If we're at the last question, loop back to the first
      if (currentQuestion === shuffledQuizData.length - 1) {
        setCurrentQuestion(0);
      } else {
        // Otherwise, go to the next question
        setCurrentQuestion(currentQuestion + 1);
      }

      // Re-enable buttons for the next question
      setButtonsDisabled(false);
    }, 10);
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

      <div className="py-3 gap-0 w-full max-w-2xl bg-black/80 backdrop-blur-sm rounded-xl shadow-[0_0_15px_rgba(0,255,128,0.3)] border border-green-500/30 overflow-hidden relative z-10">
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
              <BiQuestionMark className="h-6 w-6 text-green-300" />
            </motion.div>

            <h1 className="text-2xl font-bold text-green-300 tracking-wider">
              ポイ活
            </h1>

            <motion.div
              animate={{ rotate: -360 }}
              transition={{
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <Coins className="h-6 w-6 text-green-300" />
            </motion.div>
          </div>

          {/* Tech decorations */}
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-black/50 rounded-t-full border-t border-l border-r border-green-500/30"></div>
        </div>

        <div className="p-6 flex flex-col items-center relative">
          {/* Particle effects */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full z-20"
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

          {/* Question */}
          <div className="w-full mb-6">
            <div className="relative p-4 border border-green-500/30 rounded-lg bg-black/50 shadow-[0_0_10px_rgba(0,255,128,0.2)]">
              <div className="absolute -top-3 left-4 bg-black px-2 text-green-400 text-xs font-mono">
                QUESTION
              </div>
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-xl font-mono leading-tight tracking-wide text-green-300 py-2"
              >
                {shuffledQuizData[currentQuestion].question}
              </motion.div>

              {/* Scan line effect */}
              <motion.div
                className="absolute inset-0 bg-green-500/5 pointer-events-none"
                animate={{ top: ["100%", "-20%"] }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              ></motion.div>
            </div>
          </div>

          {/* Options */}
          <div className="w-full space-y-3 mb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid gap-3"
              >
                {shuffledQuizData[currentQuestion].options.map(
                  (option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleSelectAnswer(option)}
                      disabled={buttonsDisabled}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileTap={{
                        scale: 1.1,
                        boxShadow: "0 0 15px rgba(0, 255, 128, 0.5)",
                      }}
                      className={`
                      ${buttonsDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                      relative overflow-hidden group flex items-center p-4 border border-green-500/30 rounded-md 
                      bg-black/50 text-left font-mono transition-all
                      ${!buttonsDisabled && "hover:bg-green-900/20 hover:border-green-400/50 hover:shadow-[0_0_10px_rgba(0,255,128,0.2)]"}
                    `}
                    >
                      <span className="text-white">{option}</span>

                      {/* Button glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                      {/* Scan line */}
                      <motion.div
                        className="absolute inset-0 bg-green-400/10 mix-blend-overlay pointer-events-none"
                        animate={{ top: ["100%", "-100%"] }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        }}
                      ></motion.div>
                    </motion.button>
                  ),
                )}
              </motion.div>
            </AnimatePresence>
          </div>
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

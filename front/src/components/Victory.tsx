"use client";

import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Trophy, Star, RotateCcw, Home, Share2, Award } from "lucide-react";
import confetti from "canvas-confetti";

export default function Victory({
  score = 12500,
  level = 5,
  stars = 3,
  onPlayAgain = () => console.log("Play again clicked"),
  onMainMenu = () => console.log("Main menu clicked"),
}) {
  const [showScreen, setShowScreen] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    // Trigger animations in sequence
    setTimeout(() => setShowScreen(true), 100);
    setTimeout(() => {
      setShowScore(true);
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10B981", "#059669", "#34D399", "#A7F3D0"],
      });
    }, 600);
    setTimeout(() => setShowStars(true), 1200);
    setTimeout(() => setShowButtons(true), 1800);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <div className="absolute inset-0 overflow-hidden">
        {/* Cyber grid background */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="h-full w-full bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        </div>

        {/* Glowing orbs in background */}
        <div className="absolute left-1/4 top-1/4 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-3xl"></div>
      </div>

      <Card
        className={`relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-emerald-500/20 bg-black/80 p-6 shadow-[0_0_15px_rgba(16,185,129,0.5)] backdrop-blur-sm transition-all duration-500 ${
          showScreen ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-emerald-500/30 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-emerald-500/30 blur-3xl"></div>

        {/* Victory header */}
        <div className="mb-6 text-center">
          <div className="mb-2 flex justify-center">
            <Trophy className="h-12 w-12 text-emerald-400" />
          </div>
          <h1 className="text-center font-mono text-4xl font-bold uppercase tracking-wider text-white">
            <span className="mr-2 inline-block animate-pulse text-emerald-400">
              [
            </span>
            VICTORY
            <span className="ml-2 inline-block animate-pulse text-emerald-400">
              ]
            </span>
          </h1>
          <div className="mt-2 text-emerald-400">MISSION COMPLETE</div>
        </div>

        {/* Score section */}
        <div
          className={`mb-6 rounded-lg border border-emerald-500/30 bg-gray-900/50 p-4 transition-all duration-500 ${
            showScore ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="mb-2 text-center text-sm text-emerald-400">
            FINAL SCORE
          </div>
          <div className="text-center font-mono text-4xl font-bold text-white">
            {score.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-emerald-500/20 pt-2">
            <div>
              <div className="text-xs text-emerald-400">LEVEL</div>
              <div className="font-mono text-xl text-white">{level}</div>
            </div>
            <div>
              <div className="text-xs text-emerald-400">RANK</div>
              <div className="font-mono text-xl text-white">S</div>
            </div>
            <div>
              <div className="text-xs text-emerald-400">TIME</div>
              <div className="font-mono text-xl text-white">02:45</div>
            </div>
          </div>
        </div>

        {/* Stars rating */}
        <div
          className={`mb-6 flex justify-center space-x-4 transition-all duration-500 ${
            showStars ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                i < stars ? "bg-emerald-500" : "bg-gray-700"
              } transition-all duration-300 ${
                showStars && i < stars
                  ? "animate-[bounce_0.5s_ease-in-out_" + i * 0.1 + "s]"
                  : ""
              }`}
            >
              <Star
                className={`h-7 w-7 ${i < stars ? "text-white" : "text-gray-500"}`}
              />
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div
          className={`mb-6 grid grid-cols-3 gap-2 transition-all duration-500 ${
            showStars ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {[
            { icon: Award, label: "PERFECT", active: true },
            { icon: Award, label: "SPEEDY", active: true },
            { icon: Award, label: "MASTER", active: false },
          ].map((achievement, i) => (
            <div
              key={i}
              className={`flex flex-col items-center rounded-md p-2 ${
                achievement.active ? "text-emerald-400" : "text-gray-600"
              }`}
            >
              <achievement.icon
                className={`h-5 w-5 ${achievement.active ? "text-emerald-400" : "text-gray-600"}`}
              />
              <div className="mt-1 text-center text-xs">
                {achievement.label}
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div
          className={`grid grid-cols-2 gap-3 transition-all duration-500 ${
            showButtons
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <Button
            onClick={onPlayAgain}
            className="border border-emerald-500 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Play Again
          </Button>
          <Button
            onClick={onMainMenu}
            variant="outline"
            className="border-emerald-500/50 bg-transparent text-emerald-400 hover:bg-emerald-500/10"
          >
            <Home className="mr-2 h-4 w-4" />
            Main Menu
          </Button>
          <Button className="col-span-2 border border-emerald-500/30 bg-transparent text-emerald-400 hover:bg-emerald-500/10">
            <Share2 className="mr-2 h-4 w-4" />
            Share Score
          </Button>
        </div>

        {/* Cyber decorative elements */}
        <div className="absolute bottom-0 left-0 h-1 w-1/3 bg-gradient-to-r from-emerald-500 to-transparent"></div>
        <div className="absolute right-0 top-0 h-1 w-1/3 bg-gradient-to-l from-emerald-500 to-transparent"></div>
        <div className="absolute bottom-6 right-6 h-20 w-1 animate-pulse bg-emerald-500/50"></div>
        <div className="absolute left-6 top-6 h-1 w-20 animate-pulse bg-emerald-500/50"></div>
      </Card>
    </div>
  );
}

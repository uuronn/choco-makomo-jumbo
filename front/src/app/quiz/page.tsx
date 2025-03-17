"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { ChevronRight, Zap } from "lucide-react";

export default function CyberQuiz() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // サンプルクイズデータ
  const quizData = [
    {
      question: "ブロックチェーンに主に使用されるテクノロジーは？",
      options: ["量子コンピューティング", "暗号技術", "人工知能", "仮想現実"],
      correctAnswer: "暗号技術",
    },
    {
      question: "CPUとは何の略ですか？",
      options: [
        "Central Processing Unit",
        "Computer Personal Unit",
        "Central Program Utility",
        "Core Processing Unit",
      ],
      correctAnswer: "Central Processing Unit",
    },
    {
      question: "次のうちプログラミング言語ではないものは？",
      options: ["Python", "Java", "HTML", "Nexus"],
      correctAnswer: "Nexus",
    },
  ];

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] opacity-10 bg-cover bg-center pointer-events-none" />
      <Card className="w-full max-w-2xl border-green-500/50 bg-black/80 backdrop-blur-sm text-green-400 shadow-[0_0_15px_rgba(0,255,0,0.3)]">
        <CardHeader className="border-b border-green-500/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-mono tracking-wide flex items-center">
              <Zap className="mr-2 h-6 w-6 text-green-400" />
              CYBER<span className="text-green-500">QUIZ</span>
            </CardTitle>
            <div className="text-sm font-mono">
              Q{currentQuestion + 1}/{quizData.length}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-8">
            <div className="text-xl font-mono leading-tight tracking-wide text-green-300">
              {quizData[currentQuestion].question}
            </div>

            <div className="grid gap-3">
              {quizData[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(option)}
                  className={cn(
                    "flex items-center p-4 border border-green-500/30 rounded-md bg-black/50 text-left font-mono transition-all",
                    "hover:bg-green-900/20 hover:border-green-400/50 hover:shadow-[0_0_10px_rgba(0,255,0,0.2)]",
                    selectedAnswer === option &&
                      "bg-green-900/30 border-green-400/70 shadow-[0_0_15px_rgba(0,255,0,0.3)]",
                  )}
                >
                  <div className="flex items-center justify-center w-8 h-8 mr-3 border border-green-500/50 rounded-full text-sm">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-green-500/30 pt-4">
          <div className="text-xs text-green-500/70 font-mono">
            回答を選択してください
          </div>
          <Button
            onClick={handleNextQuestion}
            disabled={!selectedAnswer}
            className="bg-green-900/50 text-green-300 border border-green-500/50 hover:bg-green-800/50 hover:text-green-200 font-mono"
          >
            次へ <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

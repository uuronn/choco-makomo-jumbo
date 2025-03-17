"use client";

import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

export interface WaitingProps {
  message?: string;
}

export default function Waiting({ message = "Waiting..." }: WaitingProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/90 z-50">
      {/* Cyber background effect - simplified */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(16,185,129,0.1)_0%,rgba(0,0,0,0)_70%)]"></div>

      {/* Spinner - simplified for immediate rendering */}
      <div className="cyber-spinner">
        <div className="spinner-outer"></div>
        <div className="spinner-middle"></div>
        <div className="spinner-inner"></div>
        <div className="spinner-core"></div>
      </div>

      {/* Message with CSS animated dots */}
      <div className="mt-8 text-emerald-400 font-mono text-lg tracking-wider px-4 py-1 relative">
        <span>
          {message}
          <span className="dots-animation"></span>
        </span>
      </div>
      <div>
        <Button
          onClick={() => {}}
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
      </div>
      {/* CSS for cyber elements - optimized for immediate display */}
      <style jsx>{`
        .cyber-spinner {
          position: relative;
          width: 80px;
          height: 80px;
          will-change: transform;
        }

        .spinner-outer {
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: #10b981;
          border-left-color: #10b981;
          animation: spin-cw 1.5s linear infinite;
          will-change: transform;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.7);
        }

        .spinner-middle {
          position: absolute;
          width: 60px;
          height: 60px;
          top: 10px;
          left: 10px;
          border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: #10b981;
          border-right-color: #10b981;
          animation: spin-ccw 1.2s linear infinite;
          will-change: transform;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.7);
        }

        .spinner-inner {
          position: absolute;
          width: 40px;
          height: 40px;
          top: 20px;
          left: 20px;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: #10b981;
          border-left-color: #10b981;
          animation: spin-cw 0.9s linear infinite;
          will-change: transform;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.7);
        }

        .spinner-core {
          position: absolute;
          top: 30px;
          left: 30px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 15px 5px rgba(16, 185, 129, 0.7);
          animation: pulse 1s ease-in-out infinite alternate;
          will-change: opacity, transform;
        }

        @keyframes spin-cw {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-ccw {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(-360deg);
          }
        }

        @keyframes pulse {
          0% {
            opacity: 0.5;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Dots animation with pure CSS */
        .dots-animation::after {
          content: "";
          animation: dots 1s infinite steps(4);
          will-change: content;
        }

        @keyframes dots {
          0%,
          20% {
            content: "";
          }
          40% {
            content: ".";
          }
          60% {
            content: "..";
          }
          80%,
          100% {
            content: "...";
          }
        }
      `}</style>
    </div>
  );
}

"use client";

export interface CreateLoadingProps {
	message?: string;
	handleCancelCreate?: () => void;
}

export default function CreateLoading({
	message = "Loading...",
	handleCancelCreate,
}: CreateLoadingProps) {
	return (
		<div className="fixed inset-0 flex flex-col items-center justify-center bg-black/90 z-50">
			{/* Cyber background effect - simplified */}
			<div className="absolute inset-0 bg-[radial-gradient(circle,rgba(16,185,129,0.1)_0%,rgba(0,0,0,0)_70%)]" />

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

			<div className="absolute bottom-[14vh] md:bottom-[30vh]">
				{/* Repositioned and restyled cancel button */}
				{handleCancelCreate && (
					<button
						type="button"
						onClick={handleCancelCreate}
						className="mt-12 px-6 py-2 bg-transparent border-2 border-emerald-500 text-emerald-400 rounded-md hover:bg-emerald-900/30 hover:text-emerald-300 transition-all duration-300 font-mono tracking-wide relative overflow-hidden group cursor-pointer"
					>
						<span className="relative z-10">ルームを閉じる</span>
						<span className="absolute inset-0 bg-emerald-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
					</button>
				)}
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

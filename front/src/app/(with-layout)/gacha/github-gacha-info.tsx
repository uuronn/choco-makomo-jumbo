"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
	Github,
	X,
	Info,
	Code,
	Star,
	GitBranch,
	Users,
	FileCode,
	GithubIcon,
} from "lucide-react";
import { Button } from "~/components/ui/button";

type Props = {
	isOpen: boolean;
	onClose: () => void;
};

export default function GithubGachaInfo({ isOpen, onClose }: Props) {
	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onClose}
				>
					<motion.div
						className="w-full max-w-md bg-black/90 backdrop-blur-sm rounded-xl shadow-[0_0_30px_rgba(0,255,128,0.3)] border border-green-500/30 overflow-hidden relative z-10"
						initial={{ scale: 0.9, y: 20 }}
						animate={{ scale: 1, y: 0 }}
						exit={{ scale: 0.9, y: 20 }}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="bg-gradient-to-r from-green-900/80 to-green-700/80 p-4 relative">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<GithubIcon className="h-5 w-5 text-green-300" />
									<h2 className="text-xl font-bold text-green-300 tracking-wider">
										GitHub技術ガチャとは
									</h2>
								</div>
								<Button
									variant="ghost"
									size="icon"
									className="text-green-300 hover:text-white hover:bg-green-800/50"
									onClick={onClose}
								>
									<X className="h-5 w-5" />
								</Button>
							</div>
						</div>

						{/* Content */}
						<div className="p-6 text-green-200">
							<div className="space-y-4">
								<div className="flex items-start gap-3">
									<Info className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
									<p>
										GitHub技術ガチャは、GitHubリポジトリのURLを入力することで、そのリポジトリに関連する技術キャラクターを獲得できる特別なガチャです。
									</p>
								</div>

								<div className="flex items-start gap-3">
									<Code className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
									<p>
										リポジトリの言語、スター数、コミット履歴などを分析し、そのリポジトリを最も特徴づける技術キャラクターが出現します。
									</p>
								</div>

								<div className="flex items-start gap-3">
									<Star className="h-5 w-5 text-yellow-400 mt-1 flex-shrink-0" />
									<p>
										人気の高いリポジトリや、特定の技術に特化したリポジトリからは、レアリティの高いキャラクターが出現する可能性が高まります。
									</p>
								</div>

								<div className="flex items-start gap-3">
									<GitBranch className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
									<p>
										同じリポジトリからは基本的に同じキャラクターが出現しますが、リポジトリの更新状況によって能力値や特性が変化することがあります。
									</p>
								</div>

								<div className="flex items-start gap-3">
									<Users className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
									<p>
										コントリビューターの多いプロジェクトからは、チームワーク能力の高いキャラクターが出現しやすくなります。
									</p>
								</div>

								<div className="flex items-start gap-3">
									<FileCode className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
									<p>
										コードの品質や構造によって、キャラクターの特殊スキルやパッシブスキルの効果が決まります。
									</p>
								</div>

								<div className="mt-6 p-3 bg-green-900/30 rounded-lg border border-green-500/30">
									<p className="text-sm text-center">
										<span className="font-bold text-green-300">
											コスト: 100 ポイント / 1回
										</span>
										<br />
										<span className="text-xs text-green-400/70">
											通常ガチャよりも高コストですが、特定の技術キャラクターを狙って獲得できる可能性があります。
										</span>
									</p>
								</div>
							</div>
						</div>

						{/* Footer */}
						<div className="p-4 bg-black/50 border-t border-green-500/20 flex justify-center">
							<Button
								className="bg-green-700 hover:bg-green-600 text-white border border-green-500/50"
								onClick={onClose}
							>
								閉じる
							</Button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface Character {
	id: number;
	name: string;
	imageUrl: string;
	rarity: number;
	type: string;
	baseLife: number;
	basePower: number;
	baseSpeed: number;
	baseEvasion: number;
}

export default function GachaDialog() {
	const [characters, setCharacters] = useState<Character[]>([]);
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const fetchCharacters = async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/characters`,
				);
				const data = await res.json();

				setCharacters(data);
			} catch (e) {
				console.log(e);
			}
		};
		fetchCharacters();
	}, []);

	const openDialog = () => setIsOpen(true);
	const closeDialog = () => setIsOpen(false);

	return (
		<div className="flex items-center justify-center">
			<Button
				onClick={openDialog}
				className="font-bold z-30 h-12 mt-5 w-[200px] bg-emerald-600 text-black hover:bg-emerald-500 border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-300 font-mono uppercase tracking-wider"
			>
				技術一覧
			</Button>

			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					{/* Backdrop */}
					<div
						className="absolute inset-0 bg-black/70 backdrop-blur-sm"
						onClick={closeDialog}
					/>

					{/* Dialog */}
					<div
						className={cn(
							"relative z-50 w-[800px]  rounded-md p-1",
							"bg-black border-2 border-emerald-500",
							"shadow-[0_0_25px_rgba(16,185,129,0.6)]",
							"animate-in fade-in zoom-in-95 duration-300",
							"max-h-[90vh] flex flex-col", // 最大高さを設定し、flexboxを使用
						)}
					>
						{/* Decorative elements */}
						<div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
						<div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
						<div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
						<div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />

						<div className="bg-gray-900/80 p-6 rounded-sm flex flex-col flex-1 overflow-hidden">
							{/* Header - 固定 */}
							<div className="flex items-center w-screen justify-between mb-4 border-b border-emerald-500/50 pb-2">
								<h2 className="text-emerald-400 font-mono text-xl tracking-wider">
									技術一覧
								</h2>
								<Button
									variant="ghost"
									size="icon"
									onClick={closeDialog}
									className="h-8 w-8 rounded-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50"
								>
									<X className="h-4 w-4" />
								</Button>
							</div>

							{/* Content - スクロール可能 */}
							<div className="flex-1 overflow-y-auto pr-2 mb-4 custom-scrollbar">
								<div className="grid gap-4">
									{characters.map((character) => (
										<div
											key={character.id}
											className="border border-emerald-700/50 bg-gray-900/60 rounded-sm p-3 hover:border-emerald-500/70 transition-all duration-200"
										>
											<div className="flex gap-4">
												{/* Character Image */}
												<div className="w-20 h-20 flex-shrink-0 bg-gray-800 rounded-sm overflow-hidden border border-emerald-800">
													{character.imageUrl ? (
														<img
															src={character.imageUrl || "/placeholder.svg"}
															alt={character.name}
															className="w-full h-full object-cover"
														/>
													) : (
														<div className="w-full h-full flex items-center justify-center text-emerald-700">
															No Image
														</div>
													)}
												</div>

												{/* Character Info */}
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-1">
														<h3 className="text-emerald-300 font-bold">
															{character.name}
														</h3>
														<div className="px-1.5 py-0.5 bg-emerald-900/60 rounded text-xs text-emerald-400">
															{"★".repeat(character.rarity)}
														</div>
														<div className="px-1.5 py-0.5 bg-emerald-900/60 rounded text-xs text-emerald-400">
															{character.type}
														</div>
													</div>

													{/* Stats */}
													<div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-2">
														<div className="flex justify-between">
															<span className="text-emerald-500/80">HP:</span>
															<span className="text-emerald-200">
																{character.baseLife}
															</span>
														</div>
														<div className="flex justify-between">
															<span className="text-emerald-500/80">
																パワー:
															</span>
															<span className="text-emerald-200">
																{character.basePower}
															</span>
														</div>
														<div className="flex justify-between">
															<span className="text-emerald-500/80">
																スピード:
															</span>
															<span className="text-emerald-200">
																{character.baseSpeed}
															</span>
														</div>
														<div className="flex justify-between">
															<span className="text-emerald-500/80">
																回避率:
															</span>
															<span className="text-emerald-200">
																{character.baseEvasion}%
															</span>
														</div>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Footer - 固定 */}
							<div className="mt-auto flex justify-end">
								<Button
									onClick={closeDialog}
									className="bg-emerald-700 hover:bg-emerald-600 text-black border border-emerald-500 text-sm font-mono uppercase tracking-wider px-4"
								>
									閉じる
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

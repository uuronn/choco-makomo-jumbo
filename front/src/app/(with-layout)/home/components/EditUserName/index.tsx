"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Edit2, X } from "lucide-react";

type Props = {
	currentName: string;
};

export function EditUserName({ currentName }: Props) {
	const [isEditingName, setIsEditingName] = useState(false);
	const [newName, setNewName] = useState(currentName);
	const [nameError, setNameError] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const startEditingName = () => {
		setIsEditingName(true);
	};

	const cancelEditingName = () => {
		setIsEditingName(false);
		setNewName(currentName);
		setNameError("");
	};

	const saveNewName = () => {
		if (newName.length > 10) {
			setNameError("名前は10文字以下にしてください");
			return;
		}
		if (newName.trim() === "") {
			setNameError("名前を入力してください");
			return;
		}
		setIsEditingName(false);
		setNameError("");
	};

	useEffect(() => {
		if (isEditingName && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isEditingName]);

	return (
		<div className="flex items-center">
			{/* {isEditingName ? (
				<div className="flex items-center gap-2 w-full h-[28px] animate-fade-in">
					<div className="relative flex-1">
						<input
							ref={inputRef}
							type="text"
							value={newName}
							onChange={(e) => {
								setNewName(e.target.value);
								if (e.target.value.length > 10) {
									setNameError("名前は10文字以下にしてください");
								} else {
									setNameError("");
								}
							}}
							maxLength={10}
							className="w-full bg-black/50 border border-green-500/50 rounded px-2 py-1 text-green-300 font-mono focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
							placeholder="ユーザー名（10文字以下）"
						/>
						{nameError && (
							<div className="absolute -bottom-5 left-0 text-xs text-red-400">
								{nameError}
							</div>
						)}
					</div>
					<button
						type="button"
						onClick={saveNewName}
						className="p-1 cursor-pointer rounded-full bg-green-900/50 border border-green-500/50 text-green-400 hover:bg-green-800/50 transition-colors"
					>
						<Check className="h-4 w-4" />
					</button>
					<button
						type="button"
						onClick={cancelEditingName}
						className="p-1 cursor-pointer rounded-full bg-red-900/50 border border-red-500/50 text-red-400 hover:bg-red-800/50 transition-colors"
					>
						<X className="h-4 w-4" />
					</button>
				</div> */}

			<div className="flex items-center gap-2 animate-fade-in">
				<h2 className="text-lg font-bold text-green-300 font-mono">
					{currentName}
				</h2>
				{/* <button
					type="button"
					onClick={startEditingName}
					className="p-1 cursor-pointer rounded-full bg-black/50 border border-green-500/30 text-green-500/70 hover:text-green-400 hover:border-green-500/50 transition-colors"
				>
					<Edit2 className="h-3.5 w-3.5" />
				</button> */}
			</div>
		</div>
	);
}

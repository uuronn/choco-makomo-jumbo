"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { AlertCircle, ArrowLeft, Info, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import Link from "next/link";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Progress } from "~/components/ui/progress";
import DOMPurify from "dompurify";
import { useUserContext } from "~/context/UserProvider";

// 文字数制限の定数
const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 2000;

export default function BugReportForm() {
	const { user } = useUserContext();
	const [formData, setFormData] = useState({
		reportType: "bug", // デフォルトはバグ報告
		title: "",
		description: "",
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitStatus, setSubmitStatus] = useState<
		"idle" | "success" | "error"
	>("idle");
	const [errorMessage, setErrorMessage] = useState("");
	const [submissionsLeft, setSubmissionsLeft] = useState(30);
	const [totalPoints, setTotalPoints] = useState(0);
	const [showPointsAnimation, setShowPointsAnimation] = useState(false);
	const [securityWarning, setSecurityWarning] = useState<string | null>(null);

	// ローカルストレージからデータを読み込む（実際のアプリではサーバーサイドで管理）
	useEffect(() => {
		const storedSubmissions = localStorage.getItem("submissionsLeft");
		const storedPoints = localStorage.getItem("totalPoints");

		if (storedSubmissions) {
			setSubmissionsLeft(Number.parseInt(storedSubmissions));
		}

		if (storedPoints) {
			setTotalPoints(Number.parseInt(storedPoints));
		}
	}, []);

	// データをローカルストレージに保存（実際のアプリではサーバーサイドで管理）
	useEffect(() => {
		localStorage.setItem("submissionsLeft", submissionsLeft.toString());
		localStorage.setItem("totalPoints", totalPoints.toString());
	}, [submissionsLeft, totalPoints]);

	// 文字数に基づいたカラーを返す関数
	const getCounterColor = (current: number, max: number) => {
		const percentage = (current / max) * 100;
		if (percentage < 80) return "text-green-300";
		if (percentage < 95) return "text-yellow-300";
		return "text-red-400";
	};

	// 入力値のXSS対策チェック
	const checkForMaliciousContent = (value: string): boolean => {
		// 潜在的な悪意のあるパターンをチェック
		const suspiciousPatterns = [
			/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
			/javascript:/gi,
			/on\w+=/gi,
			/data:/gi,
			/<iframe/gi,
			/<img[^>]+onerror/gi,
		];

		return suspiciousPatterns.some((pattern) => pattern.test(value));
	};

	// 同じ文字が連続して繰り返されているかチェック
	const checkForRepeatedCharacters = (value: string): boolean => {
		// 3文字以上の同じ文字の繰り返しを検出する正規表現
		const repeatedCharPattern = /(.)\1{2,}/;
		return repeatedCharPattern.test(value);
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;

		// 文字数制限を適用
		if (name === "title" && value.length > TITLE_MAX_LENGTH) return;
		if (name === "description" && value.length > DESCRIPTION_MAX_LENGTH) return;

		// XSS対策のチェック
		if (checkForMaliciousContent(value)) {
			setSecurityWarning(
				"セキュリティ上の問題があるコンテンツが検出されました。HTMLやJavaScriptコードは入力しないでください。",
			);
		} else if (checkForRepeatedCharacters(value)) {
			setSecurityWarning(
				"同じ文字が連続して使われています。より詳細な説明を入力してください。",
			);
		} else {
			setSecurityWarning(null);
		}

		// 入力値をサニタイズして保存
		const sanitizedValue = DOMPurify.sanitize(value);
		setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
	};

	const handleReportTypeChange = (value: string) => {
		setFormData((prev) => ({ ...prev, reportType: value }));
	};

	const validateForm = () => {
		if (submissionsLeft <= 0) return "送信回数の上限に達しました";
		if (!formData.title.trim()) return "タイトルを入力してください";
		if (formData.title.length > TITLE_MAX_LENGTH)
			return `タイトルは${TITLE_MAX_LENGTH}文字以内で入力してください`;
		if (checkForRepeatedCharacters(formData.title))
			return "タイトルに同じ文字が連続して使われています";
		if (!formData.description.trim()) return "詳細を入力してください";
		if (formData.description.length > DESCRIPTION_MAX_LENGTH)
			return `詳細は${DESCRIPTION_MAX_LENGTH}文字以内で入力してください`;
		if (checkForRepeatedCharacters(formData.description))
			return "詳細に同じ文字が連続して使われています";
		if (securityWarning) return securityWarning;
		return null;
	};

	// レポートタイプに基づいたラベルとプレースホルダーを取得
	const getTitleLabel = () => {
		switch (formData.reportType) {
			case "bug":
				return "バグのタイトル";
			case "feature":
				return "機能のタイトル";
			case "other":
				return "報告のタイトル";
			default:
				return "タイトル";
		}
	};

	const getTitlePlaceholder = () => {
		switch (formData.reportType) {
			case "bug":
				return "バグを簡潔に説明してください";
			case "feature":
				return "欲しい機能を簡潔に説明してください";
			case "other":
				return "報告内容を簡潔に説明してください";
			default:
				return "タイトルを入力してください";
		}
	};

	const getDescriptionLabel = () => {
		switch (formData.reportType) {
			case "bug":
				return "バグの詳細説明";
			case "feature":
				return "機能の詳細説明";
			case "other":
				return "報告の詳細説明";
			default:
				return "詳細説明";
		}
	};

	const getDescriptionPlaceholder = () => {
		switch (formData.reportType) {
			case "bug":
				return "バグの詳細を説明してください";
			case "feature":
				return "欲しい機能の詳細や使用シーンを説明してください";
			case "other":
				return "報告内容の詳細を説明してください";
			default:
				return "詳細を入力してください";
		}
	};

	const getSuccessMessage = () => {
		switch (formData.reportType) {
			case "bug":
				return "バグ報告を受け付けました。調査結果はメールでお知らせします。";
			case "feature":
				return "機能リクエストを受け付けました。検討結果はメールでお知らせします。";
			case "other":
				return "ご報告ありがとうございます。内容を確認させていただきます。";
			default:
				return "送信が完了しました。";
		}
	};

	const getSubmitButtonText = () => {
		if (isSubmitting) return "送信中...";
		if (submissionsLeft <= 0) return "送信上限に達しました";
		if (securityWarning) return "セキュリティ警告があります";

		switch (formData.reportType) {
			case "bug":
				return "バグを報告する";
			case "feature":
				return "機能をリクエストする";
			case "other":
				return "報告を送信する";
			default:
				return "送信する";
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const validationError = validateForm();
		if (validationError) {
			setSubmitStatus("error");
			setErrorMessage(validationError);
			return;
		}

		setIsSubmitting(true);
		setSubmitStatus("idle");

		try {
			// 送信データの最終サニタイズ
			const sanitizedData = {
				reportType: DOMPurify.sanitize(formData.reportType),
				title: DOMPurify.sanitize(formData.title),
				description: DOMPurify.sanitize(formData.description),
			};

			// テスト用の非同期処理をシミュレート
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// 送信回数を減らし、ポイントを加算
			setSubmissionsLeft((prev) => prev - 1);
			setTotalPoints((prev) => prev + 300);
			setShowPointsAnimation(true);

			// アニメーション終了後に非表示
			setTimeout(() => {
				setShowPointsAnimation(false);
			}, 3000);

			// 成功レスポンスをシミュレート
			setSubmitStatus("success");
			setFormData({
				reportType: "bug",
				title: "",
				description: "",
			});

			// 実際のAPIが用意されたら以下のようなコードに置き換える

			const token = await user?.getIdToken();

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/${user?.uid}/report`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(sanitizedData),
				},
			);

			const data = await response.json();

			if (data.success) {
				setSubmissionsLeft((prev) => prev - 1);
				setTotalPoints((prev) => prev + 300);
				setSubmitStatus("success");
				setFormData({
					reportType: "bug",
					title: "",
					description: "",
				});
			} else {
				throw new Error(data.message || "送信中にエラーが発生しました");
			}
		} catch (error) {
			setSubmitStatus("error");
			setErrorMessage(
				"送信中にエラーが発生しました。後でもう一度お試しください。",
			);
		} finally {
			setIsSubmitting(false);
		}
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

			{/* ポイント獲得アニメーション */}
			{showPointsAnimation && (
				<div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
					<div className="bg-black/70 text-green-400 font-mono text-4xl px-8 py-4 rounded-lg border border-green-500 shadow-[0_0_30px_rgba(0,255,128,0.5)] animate-bounce flex items-center">
						{/* <Trophy className="mr-3 h-8 w-8" /> */}
						+300 技術ポイント!
					</div>
				</div>
			)}

			<Card className="w-full max-w-2xl bg-black/80 backdrop-blur-sm rounded-xl shadow-[0_0_15px_rgba(0,255,128,0.3)] border border-green-500/30 overflow-hidden relative z-10">
				<CardHeader className="border-b border-green-500/30 bg-black/50">
					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<Link
								href="/"
								className="mr-4 p-2 rounded-full hover:bg-green-500/20 transition-colors"
							>
								<ArrowLeft className="h-5 w-5 text-green-400" />
							</Link>
							<div className="mb-4">
								<CardTitle className="text-xl font-bold text-green-300 font-mono mb-1">
									報告フォーム
								</CardTitle>
								<CardDescription className="text-green-300/70">
									バグ報告、機能リクエスト、その他の報告を送信できます。
								</CardDescription>
							</div>
						</div>
						{/* <Badge
							variant="outline"
							className="bg-black/50 border-green-500/50 text-green-300 px-3 py-1 flex items-center gap-1"
						>
							<Trophy className="h-4 w-4" />
							{totalPoints} ポイント
						</Badge> */}
					</div>
				</CardHeader>

				<form onSubmit={handleSubmit}>
					<CardContent className="p-6 space-y-4">
						{/* 残り送信回数表示 */}
						<div className="space-y-2">
							<div className="flex justify-between items-center">
								<div className="flex items-center text-green-300 text-sm">
									<Info className="h-4 w-4 mr-1" />
									残り送信回数: {submissionsLeft}/30
								</div>
								<span className="text-xs text-green-300/70">
									送信成功で300ポイント獲得!
								</span>
							</div>
							<Progress
								value={(submissionsLeft / 30) * 100}
								className="h-1 bg-green-900/30"
							>
								<div className="h-full bg-gradient-to-r from-green-500 to-green-300 rounded-full" />
							</Progress>
						</div>

						{/* {submitStatus === "success" && (
							<Alert className="bg-green-500/20 border-green-500 text-green-300">
								<CheckCircle2 className="h-4 w-4" />
								<AlertTitle>送信完了</AlertTitle>
								<AlertDescription>
									{getSuccessMessage()}
									<div className="mt-1 font-semibold flex items-center">
										<Trophy className="h-4 w-4 mr-1" />
										300技術ポイントを獲得しました！
									</div>
								</AlertDescription>
							</Alert>
						)} */}

						{submitStatus === "error" && (
							<Alert className="bg-red-500/20 border-red-500 text-red-300">
								<AlertCircle className="h-4 w-4" />
								<AlertTitle>エラー</AlertTitle>
								<AlertDescription>{errorMessage}</AlertDescription>
							</Alert>
						)}

						{securityWarning && (
							<Alert className="bg-yellow-500/20 border-yellow-500 text-yellow-300">
								<AlertTriangle className="h-4 w-4" />
								<AlertTitle>セキュリティ警告</AlertTitle>
								<AlertDescription>{securityWarning}</AlertDescription>
							</Alert>
						)}

						<div className="space-y-2">
							<Label className="text-green-300">レポートタイプ</Label>
							<RadioGroup
								value={formData.reportType}
								onValueChange={handleReportTypeChange}
								className="flex flex-wrap gap-4"
							>
								<div className="flex items-center space-x-2">
									<Label
										htmlFor="bug"
										className="text-green-300 cursor-pointer"
									>
										<RadioGroupItem
											value="bug"
											id="bug"
											className="border-green-500/50 text-green-500 cursor-pointer"
										/>
										バグ報告
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Label
										htmlFor="feature"
										className="text-green-300 cursor-pointer"
									>
										<RadioGroupItem
											value="feature"
											id="feature"
											className="border-green-500/50 text-green-500 cursor-pointer"
										/>
										機能リクエスト
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Label
										htmlFor="other"
										className="text-green-300 cursor-pointer"
									>
										<RadioGroupItem
											value="other"
											id="other"
											className="border-green-500/50 text-green-500 cursor-pointer"
										/>
										その他の報告
									</Label>
								</div>
							</RadioGroup>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between">
								<Label htmlFor="title" className="text-green-300">
									{getTitleLabel()}
								</Label>
								<span
									className={`text-xs ${getCounterColor(
										formData.title.length,
										TITLE_MAX_LENGTH,
									)}`}
								>
									{formData.title.length}/{TITLE_MAX_LENGTH}
								</span>
							</div>
							<Input
								id="title"
								name="title"
								value={formData.title}
								onChange={handleChange}
								placeholder={getTitlePlaceholder()}
								className={`bg-black/50 border-green-500/30 text-green-300 placeholder:text-green-300/50 ${
									formData.title.length >= TITLE_MAX_LENGTH * 0.95
										? "border-red-400"
										: ""
								}`}
								maxLength={TITLE_MAX_LENGTH}
							/>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between">
								<Label htmlFor="description" className="text-green-300">
									{getDescriptionLabel()}
								</Label>
								<span
									className={`text-xs ${getCounterColor(
										formData.description.length,
										DESCRIPTION_MAX_LENGTH,
									)}`}
								>
									{formData.description.length}/{DESCRIPTION_MAX_LENGTH}
								</span>
							</div>
							<Textarea
								id="description"
								name="description"
								value={formData.description}
								onChange={handleChange}
								placeholder={getDescriptionPlaceholder()}
								className={`bg-black/50 border-green-500/30 text-green-300 placeholder:text-green-300/50 min-h-[150px] ${
									formData.description.length >= DESCRIPTION_MAX_LENGTH * 0.95
										? "border-red-400"
										: ""
								}`}
								maxLength={DESCRIPTION_MAX_LENGTH}
							/>
						</div>
					</CardContent>

					<CardFooter className="border-t border-green-500/30 bg-black/50 p-4">
						<Button
							type="submit"
							disabled={
								isSubmitting || submissionsLeft <= 0 || !!securityWarning
							}
							className={`ml-auto cursor-pointer font-mono ${
								submissionsLeft <= 0 || !!securityWarning
									? "bg-gray-600 cursor-not-allowed"
									: "bg-green-600 hover:bg-green-500"
							} text-white`}
						>
							{/* {getSubmitButtonText()} */}
							送信する
						</Button>
					</CardFooter>
				</form>
			</Card>

			{/* Tech decorations around the card */}
			<div className="absolute bottom-4 left-4 text-green-500/30 font-mono text-xs">
				<div>SYS:REPORT</div>
			</div>

			<div className="absolute top-4 right-4 text-green-500/30 font-mono text-xs">
				<div className="flex items-center gap-1">
					<div className="w-1 h-1 bg-green-500 rounded-full" />
				</div>
			</div>
		</div>
	);
}

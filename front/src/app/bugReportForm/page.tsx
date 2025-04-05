"use client";

import type React from "react";

import { useState } from "react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import Link from "next/link";

export default function BugReportForm() {
	const [formData, setFormData] = useState({
		category: "",
		severity: "",
		title: "",
		description: "",
		steps: "",
		browser: "",
		device: "",
		email: "",
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitStatus, setSubmitStatus] = useState<
		"idle" | "success" | "error"
	>("idle");
	const [errorMessage, setErrorMessage] = useState("");

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSelectChange = (name: string, value: string) => {
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const validateForm = () => {
		if (!formData.category) return "カテゴリーを選択してください";
		if (!formData.severity) return "重要度を選択してください";
		if (!formData.title) return "タイトルを入力してください";
		if (!formData.description) return "詳細を入力してください";
		if (!formData.email) return "メールアドレスを入力してください";
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
			return "有効なメールアドレスを入力してください";
		return null;
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
			// テスト用の非同期処理をシミュレート
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// 成功レスポンスをシミュレート
			setSubmitStatus("success");
			setFormData({
				category: "",
				severity: "",
				title: "",
				description: "",
				steps: "",
				browser: "",
				device: "",
				email: "",
			});

			// 実際のAPIが用意されたら以下のようなコードに置き換える
			/*
      const response = await fetch('/api/bug-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubmitStatus("success");
        setFormData({
          category: "",
          severity: "",
          title: "",
          description: "",
          steps: "",
          browser: "",
          device: "",
          email: "",
        });
      } else {
        throw new Error(data.message || "送信中にエラーが発生しました");
      }
      */
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

			<Card className="w-full max-w-2xl bg-black/80 backdrop-blur-sm rounded-xl shadow-[0_0_15px_rgba(0,255,128,0.3)] border border-green-500/30 overflow-hidden relative z-10">
				<CardHeader className="border-b border-green-500/30 bg-black/50">
					<div className="flex items-center">
						<Link
							href="/"
							className="mr-4 p-2 rounded-full hover:bg-green-500/20 transition-colors"
						>
							<ArrowLeft className="h-5 w-5 text-green-400" />
						</Link>
						<div>
							<CardTitle className="text-xl font-bold text-green-300 font-mono">
								バグ報告フォーム
							</CardTitle>
							<CardDescription className="text-green-300/70">
								問題の詳細を入力してください。開発チームが調査します。
							</CardDescription>
						</div>
					</div>
				</CardHeader>

				<form onSubmit={handleSubmit}>
					<CardContent className="p-6 space-y-4">
						{submitStatus === "success" && (
							<Alert className="bg-green-500/20 border-green-500 text-green-300">
								<CheckCircle2 className="h-4 w-4" />
								<AlertTitle>送信完了</AlertTitle>
								<AlertDescription>
									バグ報告を受け付けました。調査結果はメールでお知らせします。
								</AlertDescription>
							</Alert>
						)}

						{submitStatus === "error" && (
							<Alert className="bg-red-500/20 border-red-500 text-red-300">
								<AlertCircle className="h-4 w-4" />
								<AlertTitle>エラー</AlertTitle>
								<AlertDescription>{errorMessage}</AlertDescription>
							</Alert>
						)}

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="category" className="text-green-300">
									カテゴリー
								</Label>
								<Select
									value={formData.category}
									onValueChange={(value) =>
										handleSelectChange("category", value)
									}
								>
									<SelectTrigger
										id="category"
										className="bg-black/50 border-green-500/30 text-green-300"
									>
										<SelectValue placeholder="選択してください" />
									</SelectTrigger>
									<SelectContent className="bg-black border-green-500/30">
										<SelectItem value="ui">UI/デザイン</SelectItem>
										<SelectItem value="functionality">機能</SelectItem>
										<SelectItem value="performance">パフォーマンス</SelectItem>
										<SelectItem value="security">セキュリティ</SelectItem>
										<SelectItem value="other">その他</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="severity" className="text-green-300">
									重要度
								</Label>
								<Select
									value={formData.severity}
									onValueChange={(value) =>
										handleSelectChange("severity", value)
									}
								>
									<SelectTrigger
										id="severity"
										className="bg-black/50 border-green-500/30 text-green-300"
									>
										<SelectValue placeholder="選択してください" />
									</SelectTrigger>
									<SelectContent className="bg-black border-green-500/30">
										<SelectItem value="critical">致命的 - 使用不可</SelectItem>
										<SelectItem value="high">高 - 主要機能に影響</SelectItem>
										<SelectItem value="medium">中 - 一部機能に影響</SelectItem>
										<SelectItem value="low">低 - 軽微な問題</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="title" className="text-green-300">
								タイトル
							</Label>
							<Input
								id="title"
								name="title"
								value={formData.title}
								onChange={handleChange}
								placeholder="問題を簡潔に説明してください"
								className="bg-black/50 border-green-500/30 text-green-300 placeholder:text-green-300/50"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description" className="text-green-300">
								詳細説明
							</Label>
							<Textarea
								id="description"
								name="description"
								value={formData.description}
								onChange={handleChange}
								placeholder="バグの詳細を説明してください"
								className="bg-black/50 border-green-500/30 text-green-300 placeholder:text-green-300/50 min-h-[100px]"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="steps" className="text-green-300">
								再現手順
							</Label>
							<Textarea
								id="steps"
								name="steps"
								value={formData.steps}
								onChange={handleChange}
								placeholder="バグを再現するための手順を記入してください"
								className="bg-black/50 border-green-500/30 text-green-300 placeholder:text-green-300/50"
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="browser" className="text-green-300">
									ブラウザ
								</Label>
								<Input
									id="browser"
									name="browser"
									value={formData.browser}
									onChange={handleChange}
									placeholder="例: Chrome 120"
									className="bg-black/50 border-green-500/30 text-green-300 placeholder:text-green-300/50"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="device" className="text-green-300">
									デバイス
								</Label>
								<Input
									id="device"
									name="device"
									value={formData.device}
									onChange={handleChange}
									placeholder="例: iPhone 15, Windows PC"
									className="bg-black/50 border-green-500/30 text-green-300 placeholder:text-green-300/50"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email" className="text-green-300">
								連絡先メールアドレス
							</Label>
							<Input
								id="email"
								name="email"
								type="email"
								value={formData.email}
								onChange={handleChange}
								placeholder="example@domain.com"
								className="bg-black/50 border-green-500/30 text-green-300 placeholder:text-green-300/50"
							/>
						</div>
					</CardContent>

					<CardFooter className="border-t border-green-500/30 bg-black/50 p-4">
						<Button
							type="submit"
							disabled={isSubmitting}
							className="ml-auto bg-green-600 hover:bg-green-500 text-white font-mono"
						>
							{isSubmitting ? "送信中..." : "バグを報告する"}
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
					<div className="w-1 h-1 bg-green-500 rounded-full"></div>
				</div>
			</div>
		</div>
	);
}

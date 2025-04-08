<?php

namespace App\Http\Controller;

use App\Model\ReportLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use HTMLPurifier; // HTMLPurifierライブラリを使用（要インストール）
use HTMLPurifier_Config;

class ReportLogController
{
    protected $purifier;

    public function __construct()
    {
        // HTMLPurifierのインスタンスを初期化
        $config = HTMLPurifier_Config::createDefault();
        $config->set('HTML.Allowed', ''); // HTMLタグを一切許可しない
        $this->purifier = new HTMLPurifier($config);
    }

    /**
     * レポートを投稿（作成）
     */
    public function store(Request $request, string $userId)
    {
        Log::info('ReportLogController@store', [
            'userId' => $userId,
            'request' => $request->all(),
        ]);

        // 既に5件ある場合はエラーを返す
        $reportCount = ReportLog::where('userId', $userId)->count();
        if ($reportCount >= 5) {
            return response()->json([
                'message' => 'これ以上レポートを作成できません（最大5件）',
            ], 403);
        }

        // バリデーション
        $validated = $request->validate([
            'title' => 'required|string|max:100', // 文字数制限を追加
            'content' => 'required|string|max:1000', // 文字数制限を追加
            'type' => 'required|string|in:bug,feature,other', // 許可する値のみ
        ]);

        // 入力値をサニタイズ
        $title = $this->purifier->purify($validated['title']);
        $content = $this->purifier->purify($validated['content']);
        $type = $this->purifier->purify($validated['type']);

        // サニタイズ後に空になった場合はエラー
        if (empty($title) || empty($content) || empty($type)) {
            return response()->json([
                'message' => '不正な入力が検出されました',
            ], 400);
        }

        // contentが一致するレコードがあるか確認
        $existingReport = ReportLog::where('userId', $userId)
            ->where('content', $content)
            ->first();

        if ($existingReport) {
            return response()->json([
                'message' => '同じ内容のレポートが既に存在します',
            ], 400);
        }

        // レポート作成
        $report = ReportLog::create([
            'id' => (string) Str::uuid(),
            'title' => $title,
            'content' => $content,
            'type' => $type,
            'userId' => $userId,
        ]);

        return response()->json($report, 201);
    }
}

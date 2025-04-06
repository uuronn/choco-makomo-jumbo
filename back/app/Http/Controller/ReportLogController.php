<?php

namespace App\Http\Controller;

use App\Model\ReportLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ReportLogController
{
    /**
     * レポートを投稿（作成）
     */
    public function store(Request $request, string $userId)
    {

        Log::info('ReportLogController@store', [
            'userId' => $userId,
            'request' => $request->all(),
        ]);
        // 既に30件ある場合はエラーを返す
        $reportCount = ReportLog::where('userId', $userId)->count();

        if ($reportCount >= 5) {
            return response()->json([
                'message' => 'これ以上レポートを作成できません（最大5件）',
            ], 403);
        }

        // バリデーション
        $validated = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'type' => 'required|string',
        ]);

        // レポート作成
        $report = ReportLog::create([
            'id' => (string) Str::uuid(),
            'title' => $validated['title'],
            'content' => $validated['content'],
            'type' => $validated['type'],
            'userId' => $userId, // userId を保存
        ]);

        return response()->json($report, 201);
    }
}

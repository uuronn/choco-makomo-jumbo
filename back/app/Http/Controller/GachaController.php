<?php

namespace App\Http\Controller;

use App\Model\User;
use App\Model\Character;
use App\Model\UserCharacter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GachaController
{
    private const GACHA_COST = 10;
    private const DUPLICATE_POINT_REWARD = 5;

    public function gacha(Request $request)
    {
        $user = User::find($request->userId);

        if (!$user) return response()->json(['message' => 'User not found'], 404);

        if ($user->point < self::GACHA_COST) return response()->json(['message' => 'ポイントが不足しています'], 400);

        $character = Character::inRandomOrder()->first();

        // 既に所持しているか確認
        $userCharacter = UserCharacter::where('userId', $user->id)
                                    ->where('characterId', $character->id)
                                    ->first();

        if ($userCharacter) {

            $user->point += self::DUPLICATE_POINT_REWARD;
            $user->point -= self::GACHA_COST;
            $user->save();

            return response()->json([
                'message' => 'Character already owned! You received ' . self::DUPLICATE_POINT_REWARD . ' points!',
                'character' => $character,
                'new_point' => $user->point
            ]);
        }

        $user->point -= self::GACHA_COST;
        $user->save();

        $userCharacter = new UserCharacter([
            'userId' => $user->id,
            'characterId' => $character->id,
            'life' => $character->baseLife,
            'power' => $character->basePower,
            'speed' => $character->baseSpeed,
            'evasion' => $character->baseEvasion,
            'level' => 0,
        ]);

        $userCharacter->save();

        return response()->json($character, 201);
    }

    public function githubGacha(Request $request)
    {
        // 入力のバリデーション
        $request->validate([
            'githubUrl' => 'required|url'
        ]);

        // Firebase認証済みユーザーからユーザー情報を取得
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => '認証エラー：ユーザーが見つかりません'], 401);
        }

        // ユーザーモデルを取得
        $user = User::find($user->id);
        if (!$user) {
            return response()->json(['message' => 'ユーザーが見つかりません'], 404);
        }

        if ($user->point < self::GACHA_COST) {
            return response()->json(['message' => 'ポイントが不足しています'], 400);
        }

        // GitHub URLからオーナーとリポジトリ名を抽出
        $url = $request->githubUrl;
        preg_match('/github\.com\/([^\/]+)\/([^\/]+)/', $url, $matches);
        if (count($matches) < 3) {
            return response()->json(['message' => '無効なGitHubリポジトリURLです'], 400);
        }
        $owner = $matches[1];
        $repo = $matches[2];

        try {
            // 環境変数から外部APIトークンを取得
            $token = config('custom.github_language_api_token');
            if (empty($token)) {
                return response()->json(['message' => '外部APIトークンが設定されていません'], 500);
            }

            // 外部APIに認証付きリクエストを送信
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token
            ])->get("https://githublanguagesearcher-31186374967.asia-northeast1.run.app/repoLanguage/{$owner}/{$repo}");

            if ($response->failed()) {
                if ($response->status() === 401) {
                    return response()->json(['message' => '外部API認証エラー：無効なトークン'], 401);
                }
                return response()->json(['message' => 'リポジトリデータの取得に失敗しました'], 400);
            }
            $techData = $response->json();

            // キャラクターIDを小文字で取得
            $characterIds = array_map('strtolower', array_column(include base_path('characters.php'), 'id'));
            $matchingCharacters = [];

            // 言語を抽出（techDataが言語名をキーとするオブジェクト、またはlanguagesキーを持つと仮定）
            $languages = array_keys($techData['languages'] ?? $techData);
            foreach ($languages as $language) {
                $language = strtolower($language);
                // 直接一致する場合
                if (in_array($language, $characterIds)) {
                    $matchingCharacters[] = $language;
                }
                // 特殊な言語名のマッピング
                $languageMap = [
                    'c++' => 'cpp',
                    'c#' => 'csharp',
                    'javascript' => 'javascript',
                    'typescript' => 'typescript',
                    'html' => 'html',
                    'css' => 'css',
                    'go' => 'go',
                    'ruby' => 'ruby',
                    'php' => 'php',
                    'python' => 'python',
                    'java' => 'java',
                    'kotlin' => 'kotlin',
                    'swift' => 'swift',
                    'perl' => 'perl',
                    'c' => 'c',
                    'fortran' => 'fortran',
                    'sql' => 'sql',
                    'rust' => 'rust',
                    'vba' => 'vba',
                    'google apps script' => 'gas',
                    'scratch' => 'scratch',
                    'viscuit' => 'viscuit'
                ];
                if (isset($languageMap[$language]) && in_array($languageMap[$language], $characterIds)) {
                    $matchingCharacters[] = $languageMap[$language];
                }
            }

            // READMEやメタデータからフレームワークやツールを抽出
            $readmeContent = $techData['readme'] ?? '';
            $readmeKeywords = [
                'react', 'vue', 'angular', 'ruby on rails', 'laravel', 'django', 'flask',
                'spring', 'express', 'jquery', 'aws', 'azure', 'google cloud', 'firebase',
                'supabase', 'mysql', 'postgresql', 'sqlite', 'mongodb', 'docker', 'kubernetes',
                'nginx', 'apache', 'litespeed', 'caddy', 'unity', 'unreal engine', 'git',
                'webpack', 'vite'
            ];
            foreach ($readmeKeywords as $keyword) {
                if (stripos($readmeContent, $keyword) !== false && in_array(strtolower($keyword), $characterIds)) {
                    $matchingCharacters[] = strtolower($keyword);
                }
            }

            // 重複を排除
            $matchingCharacters = array_unique($matchingCharacters);

            if (empty($matchingCharacters)) {
                return response()->json(['message' => 'このリポジトリに対応するキャラクターが見つかりません'], 404);
            }

            // 所持済みキャラクターを除外
            $ownedCharacters = UserCharacter::where('userId', $user->id)
                ->pluck('characterId')
                ->toArray();
            $availableCharacters = array_diff($matchingCharacters, $ownedCharacters);

            if (empty($availableCharacters)) {
                $user->point += self::DUPLICATE_POINT_REWARD;
                $user->point -= self::GACHA_COST;
                $user->save();
                return response()->json([
                    'message' => '一致するキャラクターは全て所持済みです！' . self::DUPLICATE_POINT_REWARD . 'ポイントを獲得しました！',
                    'new_point' => $user->point
                ]);
            }

            // ランダムにキャラクターを選択
            $randomCharacterId = $availableCharacters[array_rand($availableCharacters)];
            $character = Character::where('id', $randomCharacterId)->first();

            if (!$character) {
                return response()->json(['message' => 'キャラクターが見つかりません'], 404);
            }

            // ポイントを消費してユーザーを更新
            $user->point -= self::GACHA_COST;
            $user->save();

            // 新しいUserCharacterを作成
            $userCharacter = new UserCharacter([
                'userId' => $user->id,
                'characterId' => $character->id,
                'life' => $character->baseLife,
                'power' => $character->basePower,
                'speed' => $character->baseSpeed,
                'evasion' => $character->baseEvasion,
                'level' => 0,
            ]);
            $userCharacter->save();

            return response()->json([
                'message' => 'キャラクターを獲得しました！',
                'character' => $character,
                'new_point' => $user->point
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['message' => 'リポジトリの処理中にエラーが発生しました: ' . $e->getMessage()], 500);
        }
    }
}

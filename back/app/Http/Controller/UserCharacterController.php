<?php

namespace App\Http\Controller;

use App\Model\User;
use App\Model\UserCharacter;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserCharacterController
{
    public function characterList($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $userCharacters = UserCharacter::where('user_id', $user->id)
            ->with('character')
            ->get();

        // レスポンス用にデータを整形
        $characterList = $userCharacters->map(function ($userCharacter) {
            $character = $userCharacter->character;

            return [
                // UserCharacter由来（変動値）
                'user_id' => $userCharacter->user_id,
                'character_id' => $userCharacter->character_id,
                'level' => $userCharacter->level,
                'life' => $userCharacter->life,
                'power' => $userCharacter->power,
                'speed' => $userCharacter->speed,
                // Character由来（固定値）
                'name' => $character->name,
                'type' => $character->type,
                'rarity' => $character->rarity,
                'base_evasion' => $character->base_evasion,
                'active_skill_id' => $character->active_skill_id,
                'passive_skill_id' => $character->passive_skill_id,
                'party_skill_id' => $character->party_skill_id,
                'image_url' => $character->image_url,
            ];
        });

        return response()->json($characterList, 200);
    }

    /**
     * 指定されたユーザーのキャラクターを全削除
     */
    public function destroy($userId, $characterId)
    {
        $deleted = UserCharacter::deleteUserCharacter($userId, $characterId);

        if ($deleted) {
            return response()->json([
                'message' => 'UserCharacter deleted successfully'
            ], 200);
        } else {
            return response()->json([
                'message' => 'UserCharacter not found'
            ], 404);
        }
    }

    /**
     * 指定されたユーザーのキャラクターをレベルアップ
     * 各ステータスを個別に増加させ、levelは独立して100まで
     */
    public function levelUp(Request $request)
{
    try {
        // バリデーション（コメントアウトされているので、そのまま維持）
        $request->validate([
            'user_id' => 'required|string|exists:user,id',
            'character_id' => 'required|string|exists:character,id',
            'life' => 'required|integer|min:0',
            'power' => 'required|integer|min:0',
            'speed' => 'required|integer|min:0',
        ]);

        // UserCharacterを取得
        $userCharacter = UserCharacter::where('user_id', $request->user_id)
            ->where('character_id', $request->character_id)
            ->first();

        if (!$userCharacter) {
            return response()->json(['message' => 'UserCharacter not found'], 404);
        }

        // 現在のレベルが100未満かチェック（増加後の値も考慮）
        $life = (int)$request->input('life');
        $power = (int)$request->input('power');
        $speed = (int)$request->input('speed');
        $totalIncrease = $life + $power + $speed;

        if ($userCharacter->level + $totalIncrease > 100) {
            return response()->json(['message' => 'レベルが最大値（100）を超えます'], 400);
        }

        // レベルアップ処理
        $updated = DB::transaction(function () use ($userCharacter, $life, $power, $speed, $totalIncrease) {
            // 属性を更新
            $userCharacter->life += $life;
            $userCharacter->power += $power;
            $userCharacter->speed += $speed;
            $userCharacter->level += $totalIncrease;

            // 保存前にデバッグ用ログ
            Log::info('Before save:', $userCharacter->toArray());

            // save() の代わりに update() を使用
            UserCharacter::where('user_id', $userCharacter->user_id)
                ->where('character_id', $userCharacter->character_id)
                ->update([
                    'life' => $userCharacter->life,
                    'power' => $userCharacter->power,
                    'speed' => $userCharacter->speed,
                    'level' => $userCharacter->level,
                ]);

            return $userCharacter;
        });

        return response()->json($updated, 200);
    } catch (\Exception $e) {
        // エラー詳細をログに記録
        Log::error('Level up failed: ' . $e->getMessage(), ['exception' => $e]);
        return response()->json([
            'message' => 'Failed to level up character',
            'error' => $e->getMessage(),
        ], 500);
    }
}
}

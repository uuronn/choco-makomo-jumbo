<?php

namespace App\Http\Controller;

use App\Model\User;
use App\Model\UserCharacter;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserCharacterController
{
    /**
     * 特定のユーザーのキャラクター一覧を取得
     */
    public function list($userId)
    {
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $userCharacters = UserCharacter::where('user_id', $user->id)
            ->with('character')
            ->get();

        // レスポンス用にデータを整形
        $characterList = $userCharacters->map(function ($userCharacter) {
            $character = $userCharacter->character;

            return [
                // UserCharacter（変動値）
                'user_id' => $userCharacter->user_id,
                'character_id' => $userCharacter->character_id,
                'level' => $userCharacter->level,
                'life' => $userCharacter->life,
                'power' => $userCharacter->power,
                'speed' => $userCharacter->speed,
                // Character（固定値）
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
     * 特定のユーザーのキャラクターをレベルアップ
     */
    public function levelUp(Request $request)
    {
        try {
            $request->validate([
                'user_id' => 'required|string|exists:user,id',
                'character_id' => 'required|string|exists:character,id',
                'life' => 'required|integer|min:0',
                'power' => 'required|integer|min:0',
                'speed' => 'required|integer|min:0',
            ]);

            $userId = $request->query('userId');
            $characterId = $request->query('characterId');

            $userCharacter = UserCharacter::where('user_id', $userId)
                ->where('character_id', $characterId)
                ->first();

            if (!$userCharacter) return response()->json(['message' => 'UserCharacter not found'], 404);

            // 現在のレベルが100未満かチェック（増加後の値も考慮）
            $life = $request->life;
            $power = $request->power;
            $speed = $request->speed;
            $totalIncrease = $life + $power + $speed;

            if ($userCharacter->level + $totalIncrease > 100) return response()->json(['message' => 'レベルが最大値（100）を超えます'], 400);

            // レベルアップ処理
            $updated = DB::transaction(function () use ($userCharacter, $life, $power, $speed, $totalIncrease) {
                $userCharacter->life += $life;
                $userCharacter->power += $power;
                $userCharacter->speed += $speed;
                $userCharacter->level += $totalIncrease;

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
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to level up character',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 特定のユーザーのキャラクターを全削除
     */
    public function destroy($userId)
    {
        $deletedCount = UserCharacter::where('user_id', $userId)->delete();

        if ($deletedCount > 0) {
            return response()->json([
                'message' => 'UserCharacters deleted successfully'
            ], 200);
        } else {
            return response()->json([
                'message' => 'UserCharacters not found'
            ], 404);
        }
    }
}

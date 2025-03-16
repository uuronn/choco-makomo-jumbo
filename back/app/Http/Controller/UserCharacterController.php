<?php

namespace App\Http\Controller;

use App\Model\User;
use App\Model\UserCharacter;
use Illuminate\Support\Facades\DB;

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
    public function levelUp($request)
    {
        try {
            // バリデーション
            // $request->validate([
            //     'user_id' => 'required',
            //     'character_id' => 'required',
            //     'life' => 'required|integer|min:0',
            //     'power' => 'required|integer|min:0',
            //     'speed' => 'required|integer|min:0',
            // ]);

            // UserCharacterを取得
            $userCharacter = UserCharacter::where('user_id', $request->user_id)
                                        ->where('character_id', $request->character_id)
                                        ->first();

            if (!$userCharacter) {
                return response()->json([
                    'message' => 'UserCharacter not found'
                ], 404);
            }

            // 現在のレベルが100未満かチェック
            if ($userCharacter->level >= 100) {
                return response()->json([
                    'message' => 'レベルが最大値（100）に達しています'
                ], 400);
            }

            // レベルアップ処理
            $updated = DB::transaction(function () use ($userCharacter, $request) {
                // レベルを1増やす
                $userCharacter->level += 1;

                // ステータスを増加（上限なし）
                $userCharacter->life += $request->life;
                $userCharacter->power += $request->power;
                $userCharacter->speed += $request->speed;

                $userCharacter->save();

                return $userCharacter;
            });

            return response()->json([
                'user_character' => $updated,
                'message' => 'Character leveled up successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to level up character',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

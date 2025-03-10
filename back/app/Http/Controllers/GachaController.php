<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Character;
use App\Models\UserCharacter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GachaController extends Controller
{
    public function gacha($id)
    {
        // ユーザーを検索
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $character = Character::inRandomOrder()->first(); // ランダムにキャラを取得

        // 既に所持しているか確認
        $userCharacter = UserCharacter::where('user_id', $user->id)
                                      ->where('character_id', $character->id)
                                      ->first();

        if ($userCharacter) {
            // すでに持っている場合、ポイントを加算
            $additionalPoint = 10; // 例: 重複時は10ポイント付与
            $this->updatePointInternal($user, $additionalPoint);

            return response()->json([
                'message' => 'Character already owned! You received ' . $additionalPoint . ' points!',
                'character' => $character,
                'new_point' => $user->point
            ]);
        }

        // 新規キャラを付与
        $userCharacter = new UserCharacter([
            'user_id' => $user->id,
            'character_id' => $character->id,
            'life' => $character->base_life,
            'power' => $character->base_power,
            'speed' => $character->base_speed,
            'level' => 1,
        ]);

        $userCharacter->save();

        return response()->json($character);
    }


    private function updatePointInternal($user, $additionalPoint)
    {
        $user->point += $additionalPoint;
        $user->save();
    }

    public function characterList($id)
{
    $user = User::find($id);
    if (!$user) {
        return response()->json(['error' => 'User not found'], 404);
    }

    $userCharacters = UserCharacter::where('user_id', $user->id)
        ->with('character')
        ->get();

    return response()->json($userCharacters);
}

public function trainCharacter(Request $request)
{
    $userId = $request->input('user_id');
    $characterId = $request->input('character_id');
    $powerIncrement = $request->input('power', 0); // デフォルト0
    $lifeIncrement = $request->input('life', 0);   // デフォルト0
    $speedIncrement = $request->input('speed', 0); // デフォルト0

    $userCharacter = UserCharacter::where('user_id', $userId)
        ->where('character_id', $characterId)
        ->first();

    if (!$userCharacter) {
        return response()->json(['error' => 'キャラクターが見つかりません'], 404);
    }

    // null対策を入れて加算
    Log::info('Before update', [
        'power' => $userCharacter->power,
        'life' => $userCharacter->life,
        'speed' => $userCharacter->speed,
        'increments' => [$powerIncrement, $lifeIncrement, $speedIncrement],
    ]);

    $userCharacter->power = ($userCharacter->power ?? 0) + $powerIncrement;
    $userCharacter->life = ($userCharacter->life ?? 0) + $lifeIncrement;
    $userCharacter->speed = ($userCharacter->speed ?? 0) + $speedIncrement;

    Log::info('After update', [
        'power' => $userCharacter->power,
        'life' => $userCharacter->life,
        'speed' => $userCharacter->speed,
    ]);

    // $userCharacter->save();

    // 複合主キーで直接更新
    UserCharacter::where('user_id', $userId)
        ->where('character_id', $characterId)
        ->update([
            'power' => $userCharacter->power,
            'life' => $userCharacter->life,
            'speed' => $userCharacter->speed,
            'updated_at' => now(), // タイムスタンプを手動で更新
        ]);

    return response()->json([
        'message' => 'ステータスを強化しました！',
        'userCharacter' => $userCharacter, // characterはレスポンス用に残す
    ]);
}
}

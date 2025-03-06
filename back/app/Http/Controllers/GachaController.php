<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Character;
use App\Models\UserCharacter;
use Illuminate\Http\Request;

class GachaController extends Controller
{
    public function gacha($id)
    {
        // ユーザーを検索
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $character = Character::inRandomOrder()->first(); // ランダムにキャラを1つ取得（仮）

        $userCharacter = new UserCharacter([
            'user_id' => $user->id,
            'character_id' => $character->id,
            'life' => $character->base_life,
            'power' => $character->base_power,
            'speed' => $character->base_speed,
            'level' => 1,
            // 'power'はbootメソッドで自動設定される
        ]);

        $userCharacter->save();

        return response()->json($character);
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

    // 育成: power, life, speedをリクエストの値で強化
    $userCharacter->power += 30;
    $userCharacter->life += 30;
    $userCharacter->speed += 30;
    $userCharacter->save();

    return response()->json([
        'message' => 'ステータスを強化しました！',
        'userCharacter' => $userCharacter->load('character'), // characterはレスポンス用に残す
    ]);
}
}

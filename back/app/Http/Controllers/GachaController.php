<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Character;
use App\Models\UserCharacter;
use Illuminate\Http\Request;

class GachaController extends Controller
{
    public function pull(Request $request, $id)
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
            'acquired_at' => now(),
            'level' => 1,
            'experience' => 0,
            // 'power'はbootメソッドで自動設定される
        ]);

        $userCharacter->save();

        return response()->json([
            'message' => 'キャラをゲットしました！',
            'character' => $character->name,
        ]);
    }
}

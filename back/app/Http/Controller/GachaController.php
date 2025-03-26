<?php

namespace App\Http\Controller;

use App\Model\User;
use App\Model\Character;
use App\Model\UserCharacter;
use Illuminate\Http\Request;

class GachaController
{
    public function gacha(Request $request)
    {
        $user = User::find($request->userId);

        if (!$user) return response()->json(['message' => 'User not found'], 404);

        // ガチャコスト
        $gachaCost = 10;

        if ($user->point < $gachaCost) return response()->json(['message' => 'ポイントが不足しています'], 400);

        $character = Character::inRandomOrder()->first();

        // 既に所持しているか確認
        $userCharacter = UserCharacter::where('userId', $user->id)
                                    ->where('characterId', $character->id)
                                    ->first();

        if ($userCharacter) {
            // すでに持っている場合、ポイントを加算
            $additionalPoint = 5;

            $user->point += $additionalPoint;
            $user->point -= $gachaCost;
            $user->save();

            return response()->json([
                'message' => 'Character already owned! You received ' . $additionalPoint . ' points!',
                'character' => $character,
                'new_point' => $user->point
            ]);
        }

        $user->point -= $gachaCost;
        $user->save();

        $userCharacter = new UserCharacter([
            'userId' => $user->id,
            'characterId' => $character->id,
            'life' => $character->baseLife,
            'power' => $character->basePower,
            'speed' => $character->baseSpeed,
            'evasion' => $character->base_evasion,
            'level' => 1,
        ]);

        $userCharacter->save();

        return response()->json($character, 201);
    }
}

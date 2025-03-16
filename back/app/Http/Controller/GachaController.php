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

        $character = Character::inRandomOrder()->first();

        // 既に所持しているか確認
        $userCharacter = UserCharacter::where('userId', $user->id)
                                    ->where('characterId', $character->id)
                                    ->first();

        if ($userCharacter) {
            // すでに持っている場合、ポイントを加算
            $additionalPoint = 5;

            $user->point += $additionalPoint;
            $user->save();

            return response()->json([
                'message' => 'Character already owned! You received ' . $additionalPoint . ' points!',
                'character' => $character,
                'new_point' => $user->point
            ]);
        }

        $userCharacter = new UserCharacter([
            'userId' => $user->id,
            'characterId' => $character->id,
            'life' => $character->base_life,
            'power' => $character->base_power,
            'speed' => $character->base_speed,
            'evasion' => $character->base_evasion,
            'level' => 1,
        ]);

        $userCharacter->save();

        return response()->json($character, 201);
    }
}

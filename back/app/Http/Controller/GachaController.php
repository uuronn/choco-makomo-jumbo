<?php

namespace App\Http\Controller;

use App\Model\User;
use App\Model\Character;
use App\Model\UserCharacter;
use Illuminate\Http\Request;

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
}

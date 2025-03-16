<?php

namespace App\Http\Controller;

use App\Model\Character;

class CharacterController
{
    /**
     * すべてのキャラクターを取得
     */
    public function all()
    {
        $characterList = Character::all();

        if ($characterList->isEmpty()) return response()->json(['message' => 'CharacterList not found'], 404);

        return response()->json($characterList, 200);
    }

    /**
     * 特定のキャラクターを取得
     */
    public function find($characterId)
    {
        $character = Character::find($characterId);

        if (!$character) return response()->json(['message' => 'Character not found'], 404);

        return response()->json($character, 200);
    }
}

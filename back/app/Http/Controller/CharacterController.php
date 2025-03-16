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

        if (!$characterList) return response()->json(['error' => 'CharacterList not found'], 404);

        return response()->json($characterList, 200);
    }

    /**
     * 特定のキャラクターを取得
     */
    public function find($id)
    {
        $character = Character::find($id);

        if (!$character) return response()->json(['error' => 'Character not found'], 404);

        return response()->json($character, 200);
    }
}

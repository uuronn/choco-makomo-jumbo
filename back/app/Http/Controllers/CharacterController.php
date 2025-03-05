<?php

namespace App\Http\Controllers;

use App\Models\Character;

class CharacterController extends Controller
{
    /**
     * すべてのキャラクターを取得
     */
    public function index()
    {
        $characters = Character::all();
        return response()->json($characters, 200);
    }

    /**
     * 特定のキャラクターを取得
     */
    public function show($id)
    {
        $character = Character::find($id);

        if (!$character) {
            return response()->json(['error' => 'Character not found'], 404);
        }

        return response()->json($character, 200);
    }

}

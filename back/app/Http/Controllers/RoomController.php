<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\RoomCharacter;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RoomController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'characters' => 'required|array|min:1|max:3',
            'characters.*.character_id' => 'required|string|exists:user_character,character_id,user_id,' . Str::uuid(),
            'characters.*.level' => 'required|integer|min:1',
            'characters.*.life' => 'required|integer|min:0',
            'characters.*.power' => 'required|integer|min:0',
            'characters.*.speed' => 'required|integer|min:0',
            'characters.*.skill' => 'nullable|string',
        ]);

        $room = Room::create([
            'id' => Str::uuid(),
            'user_id' => Str::uuid(),
            'status' => 'waiting',
        ]);

        // ルームキャラクターの作成
        foreach ($request->characters as $characterData) {
            RoomCharacter::create([
                'room_id' => $room->id,
                'character_id' => $characterData['character_id'],
                'level' => $characterData['level'],
                'life' => $characterData['life'],
                'power' => $characterData['power'],
                'speed' => $characterData['speed'],
                'skill' => $characterData['skill'] ?? null,
            ]);
        }

        return response()->json([
            'room' => $room->load('roomCharacters'),
            'message' => 'Room created successfully',
        ], 201);
    }
}

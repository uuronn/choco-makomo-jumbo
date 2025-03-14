<?php

namespace App\Http\Controller;

use App\Model\Room;
use App\Model\RoomCharacter;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RoomController
{
    public function store(Request $request)
    {
        try {
            // ルーム作成
            $room = Room::create([
                'id' => Str::uuid(),
                'host_user_id' => $request->host_user_id, // ホストの user_id
                'guest_user_id' => $request->guest_user_id ?? null, // ゲストの user_id（省略可能）
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
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create room',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

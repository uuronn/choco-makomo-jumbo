<?php

namespace App\Http\Controller;

use App\Model\Room;
use App\Model\RoomCharacter;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RoomController
{

    /**
     * ルーム作成
     */
    public function store(Request $request)
    {
        try {
            // すでに同じホストユーザーIDでルームが存在するかチェック
            $existingRoom = Room::where('host_user_id', $request->host_user_id)->first();

            if ($existingRoom) {
                return response()->json([
                    'message' => '既に作成したルームが存在します',
                ], 400);
            }

            // ルーム作成
            $room = Room::create([
                'id' => Str::uuid(),
                'host_user_id' => $request->host_user_id,
                'guest_user_id' => $request->guest_user_id ?? null,
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

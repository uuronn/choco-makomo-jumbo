<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\RoomCharacter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class RoomController extends Controller
{
    public function store(Request $request)
    {

        try {
        // ルーム作成
        $room = Room::create([
            'id' => Str::uuid(),
            'user_id' => $request->user_id, // リクエストから user_id を取得
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
            'room' => $room->load('roomCharacter'),
            'message' => 'Room created successfully',
        ], 201);
        } catch (\Exception $e) {


            // エラーレスポンスを返す（必要に応じて）
            return response()->json([
                'message' => 'Failed to create room',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

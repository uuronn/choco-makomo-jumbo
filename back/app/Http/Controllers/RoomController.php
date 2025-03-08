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
        // リクエストデータのログ
        Log::info('Room creation request received', [
            'request_data' => $request->all(),
            'ip_address' => $request->ip(),
        ]);

        try {
            // バリデーション
            $request->validate([
                'characters' => 'required|array|min:1|max:3',
                'characters.*.character_id' => 'required|string|exists:user_character,character_id,user_id,' . Str::uuid(),
                'characters.*.level' => 'required|integer|min:1',
                'characters.*.life' => 'required|integer|min:0',
                'characters.*.power' => 'required|integer|min:0',
                'characters.*.speed' => 'required|integer|min:0',
                'characters.*.skill' => 'nullable|string',
            ]);

            // ルーム作成前のログ
            Log::debug('Creating new room', [
                'generated_room_id' => Str::uuid(),
                'generated_user_id' => Str::uuid(),
            ]);

            $room = Room::create([
                'id' => Str::uuid(),
                'user_id' => Str::uuid(),
                'status' => 'waiting',
            ]);

            Log::info('Room created successfully', [
                'room_id' => $room->id,
                'user_id' => $room->user_id,
            ]);

            // ルームキャラクターの作成
            foreach ($request->characters as $index => $characterData) {
                Log::debug('Creating room character', [
                    'room_id' => $room->id,
                    'character_index' => $index,
                    'character_data' => $characterData,
                ]);

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

            Log::info('All room characters created', [
                'room_id' => $room->id,
                'character_count' => count($request->characters),
            ]);

            return response()->json([
                'room' => $room->load('roomCharacters'),
                'message' => 'Room created successfully',
            ], 201);
        } catch (\Exception $e) {
            // エラー時のログ
            Log::error('Failed to create room', [
                'error_message' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
            ]);

            // エラーレスポンスを返す（必要に応じて）
            return response()->json([
                'message' => 'Failed to create room',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

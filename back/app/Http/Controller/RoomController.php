<?php

namespace App\Http\Controller;

use App\Model\Room;
use App\Model\RoomCharacter;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RoomController
{

    public function index()
    {
        try {
            // ルーム一覧を取得（キャラクター情報を含めずに取得）
            $rooms = Room::select('id', 'host_user_id', 'guest_user_id', 'status')->get();

            return response()->json([
                'rooms' => $rooms,
                'message' => 'Rooms retrieved successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve rooms',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

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
                'room' => $room->load('roomCharacter'),
                'message' => 'Room created successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create room',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function join(Request $request)
    {
        try {
            // 指定されたルームが存在するかチェック
            $room = Room::where('id', $request->room_id)->first();

            if (!$room) {
                return response()->json([
                    'message' => '指定されたルームが見つかりません',
                ], 404);
            }

            // ルームの状態が "waiting" であることを確認
            if ($room->status !== 'waiting') {
                return response()->json([
                    'message' => 'このルームには参加できません',
                ], 400);
            }

            // すでにゲストユーザーが設定されているか確認
            if ($room->guest_user_id) {
                return response()->json([
                    'message' => 'このルームにはすでにゲストが参加しています',
                ], 400);
            }

            // ゲストユーザーを登録
            $room->update([
                'guest_user_id' => $request->guest_user_id,
                'status' => 'in_progress', // ルームの状態を変更
            ]);

            // ルームキャラクターの作成（ゲストユーザーのキャラクター情報がある場合）
            if (!empty($request->characters)) {
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
            }

            return response()->json([
                'room' => $room->load('roomCharacter'),
                'message' => 'Room joined successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to join room',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

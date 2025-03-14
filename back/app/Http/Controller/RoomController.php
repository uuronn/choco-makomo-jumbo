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

    public function show(Request $request, $room_id)
    {
        try {
            // 認証ユーザーを取得（フロントから `user_id` を渡す必要あり）
            $user_id = $request->user_id;

            if (!$user_id) {
                return response()->json([
                    'message' => 'ユーザーIDが必要です',
                ], 401); // 401 Unauthorized
            }

            // ルームを取得
            $room = Room::with(['roomCharacter']) // ルームに紐づくキャラ情報を取得
                        ->select('id', 'host_user_id', 'guest_user_id', 'status')
                        ->where('id', $room_id)
                        ->first();

            if (!$room) {
                return response()->json([
                    'message' => '指定されたルームが見つかりません',
                ], 404);
            }

            // **権限チェック (host_user_id もしくは guest_user_id のみ許可)**
            if ($room->host_user_id !== $user_id && $room->guest_user_id !== $user_id) {
                return response()->json([
                    'message' => 'このルームにアクセスする権限がありません',
                ], 403); // 403 Forbidden
            }

            return response()->json([
                'room' => $room,
                'room_characters' => $room->roomCharacters, // ルームキャラクターも返す
                'message' => 'Room retrieved successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve room',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function startBattle(Request $request)
    {
        try {
            // リクエストからルームIDを取得
            $roomId = $request->input('room_id');
            $userId = $request->input('user_id'); // フロント側からホストの `user_id` を送る

            // ルームを取得
            $room = Room::where('id', $roomId)->first();

            if (!$room) {
                return response()->json([
                    'message' => 'ルームが見つかりません',
                ], 404);
            }

            // リクエストしたユーザーがホストであることを確認
            if ($room->host_user_id !== $userId) {
                return response()->json([
                    'message' => 'バトル開始の権限がありません',
                ], 403);
            }

            // ルームの状態が `waiting` であることを確認
            if ($room->status !== 'waiting') {
                return response()->json([
                    'message' => 'バトルを開始できる状態ではありません',
                ], 400);
            }

            // バトル開始（status を `battling` に更新）
            $room->update(['status' => 'battling']);

            return response()->json([
                'message' => 'バトルが開始されました',
                'room' => $room,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'バトル開始に失敗しました',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function processAction(Request $request)
    {
        try {
            $roomId = $request->input('room_id');
            $userId = $request->input('user_id');
            $command = $request->input('command'); // "attack" or "defend"

            $room = Room::where('id', $roomId)->first();

            if (!$room || $room->status !== 'battling') {
                return response()->json(['message' => 'バトルが進行中ではありません'], 400);
            }

            if ($room->current_turn_user_id !== $userId) {
                return response()->json(['message' => 'あなたのターンではありません'], 403);
            }

            // ターンを切り替える
            $nextTurnUserId = $room->host_user_id === $userId ? $room->guest_user_id : $room->host_user_id;
            $room->update(['current_turn_user_id' => $nextTurnUserId]);

            return response()->json(['message' => "{$userId} が {$command} を選択しました", 'room' => $room], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => '処理に失敗しました', 'error' => $e->getMessage()], 500);
        }
    }


    public function endBattle(Request $request)
    {
        try {
            $roomId = $request->input('room_id');
            $winner = $request->input('winner'); // "host" or "guest"

            // ルームを取得
            $room = Room::where('id', $roomId)->first();

            if (!$room) {
                return response()->json([
                    'message' => 'ルームが見つかりません',
                ], 404);
            }

            // ルームの状態が `battling` でなければ処理しない
            if ($room->status !== 'battling') {
                return response()->json([
                    'message' => 'バトルが進行中ではありません',
                ], 400);
            }

            // 勝者を保存（勝者のユーザーIDを設定）
            $winnerUserId = $winner === 'host' ? $room->host_user_id : $room->guest_user_id;
            $room->update([
                'status' => 'finished',
                'winner_id' => $winnerUserId, // 勝者のIDを記録（`rooms` テーブルに `winner_id` カラムが必要）
            ]);

            return response()->json([
                'message' => 'バトル結果が保存されました',
                'room' => $room,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'バトル結果の保存に失敗しました',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

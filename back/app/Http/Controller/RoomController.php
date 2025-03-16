<?php

namespace App\Http\Controller;

use App\Model\Character;
use App\Model\Room;
use App\Model\RoomCharacter;
use App\Model\UserCharacter;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RoomController
{
    /**
     * ルーム一覧を取得
     */
    public function list()
    {
        try {
            // ルーム一覧を取得（キャラクター情報を含めずに取得）
            $rooms = Room::select('id', 'hostUserId', 'guestUserId', 'status')->get();

            return response()->json($rooms, 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve rooms',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * ルーム作成
     */
    public function create(Request $request)
    {
        try {
            $existingRoom = Room::where('hostUserId', $request->hostUserId)->first();

            if ($existingRoom) return response()->json(['message' => '既に作成したルームが存在します'], 400);

            $characterIds = $request->input('characterIdList');

            if (empty($characterIds)) return response()->json(['message' => 'キャラクターIDリストが必要です'], 400);

            $room = Room::create([
                'id' => Str::uuid(),
                'hostUserId' => $request->hostUserId,
                'guestUserId' => null,
                'status' => 'waiting',
            ]);

            foreach ($characterIds as $characterId) {
                $character = Character::find($characterId);

                if (!$character) return response()->json(['message' => "Character {$characterId} not found"], 404);

                $userCharacter = UserCharacter::where('userId', $room->hostUserId)
                    ->where('characterId', $characterId)
                    ->first();

                if (!$userCharacter) return response()->json(['message' => "UserCharacter not found"], 404);

                RoomCharacter::create([
                    'roomId' => $room->id,
                    'characterId' => $characterId,
                    'userId' => $room->guestUserId,
                    'level' => $userCharacter->level,
                    'life' => $userCharacter->life,
                    'power' => $userCharacter->power,
                    'speed' => $userCharacter->speed,
                    'evasion' =>  $character->base_evasion,
                ]);
            }

            return response()->json($room, 201);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to create room',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function join(Request $request)
    {
        try {
            $room = Room::where('id', $request->roomId)->first();

            if (!$room) {
                return response()->json([
                    'message' => '指定されたルームが見つかりません',
                ], 404);
            }

            if ($room->status !== 'waiting') {
                return response()->json([
                    'message' => 'このルームには参加できません',
                ], 400);
            }

            if ($room->guestUserId) {
                return response()->json([
                    'message' => 'このルームにはすでにゲストが参加しています',
                ], 400);
            }

            $characterIds = $request->characterIds;

            if (empty($characterIds)) {
                return response()->json(['message' => 'キャラクターIDリストが必要です'], 400);
            }

            $room->update([
                'guestUserId' => $request->guestUserId,
                'status' => 'in_progress',
            ]);

            foreach ($characterIds as $characterId) {
                $character = Character::find($characterId);

                if (!$character) {
                    return response()->json(['message' => "Character {$characterId} not found"], 404);
                }

                $userCharacter = UserCharacter::where('userId', $room->guestUserId)
                    ->where('characterId', $characterId)
                    ->first();

                if (!$userCharacter) {
                    return response()->json(['message' => "UserCharacter not found"], 404);
                }

                RoomCharacter::create([
                    'roomId' => $room->id,
                    'characterId' => $characterId,
                    'userId' => $room->guestUserId,
                    'level' => $userCharacter->level,
                    'life' => $userCharacter->life,
                    'power' => $userCharacter->power,
                    'speed' => $userCharacter->speed,
                    'evasion' => $character->base_evasion,
                ]);
            }

            return response()->json($room, 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to join room',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(Request $request, $roomId)
    {
        try {
            // 認証ユーザーを取得（フロントから `userId` を渡す必要あり）
            $userId = $request->userId;

            if (!$userId) {
                return response()->json([
                    'message' => 'ユーザーIDが必要です',
                ], 401); // 401 Unauthorized
            }

            // ルームを取得
            $room = Room::with(['roomCharacter']) // ルームに紐づくキャラ情報を取得
                        ->select('id', 'hostUserId', 'guestUserId', 'status')
                        ->where('id', $roomId)
                        ->first();

            if (!$room) {
                return response()->json([
                    'message' => '指定されたルームが見つかりません',
                ], 404);
            }

            // **権限チェック (hostUserId もしくは guestUserId のみ許可)**
            if ($room->hostUserId !== $userId && $room->guestUserId !== $userId) {
                return response()->json([
                    'message' => 'このルームにアクセスする権限がありません',
                ], 403); // 403 Forbidden
            }

            return response()->json([
                'room' => $room,
                'roomCharacters' => $room->roomCharacters, // ルームキャラクターも返す
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
            $roomId = $request->input('roomId');
            $userId = $request->input('userId'); // フロント側からホストの `userId` を送る

            // ルームを取得
            $room = Room::where('id', $roomId)->first();

            if (!$room) {
                return response()->json([
                    'message' => 'ルームが見つかりません',
                ], 404);
            }

            // リクエストしたユーザーがホストであることを確認
            if ($room->hostUserId !== $userId) {
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
            $roomId = $request->input('roomId');
            $userId = $request->input('userId');
            $command = $request->input('command'); // "attack" or "defend"

            $room = Room::where('id', $roomId)->first();

            if (!$room || $room->status !== 'battling') {
                return response()->json(['message' => 'バトルが進行中ではありません'], 400);
            }

            if ($room->currentTurnUserId !== $userId) {
                return response()->json(['message' => 'あなたのターンではありません'], 403);
            }

            // ターンを切り替える
            $nextTurnUserId = $room->hostUserId === $userId ? $room->guestUserId : $room->hostUserId;
            $room->update(['currentTurnUserId' => $nextTurnUserId]);

            return response()->json(['message' => "{$userId} が {$command} を選択しました", 'room' => $room], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => '処理に失敗しました', 'error' => $e->getMessage()], 500);
        }
    }

    public function endBattle(Request $request)
    {
        try {
            $roomId = $request->input('roomId');
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
            $winnerUserId = $winner === 'host' ? $room->hostUserId : $room->guestUserId;
            $room->update([
                'status' => 'finished',
                'winnerId' => $winnerUserId, // 勝者のIDを記録（`rooms` テーブルに `winnerId` カラムが必要）
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

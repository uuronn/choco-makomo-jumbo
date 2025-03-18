<?php

namespace App\Http\Controller;

use App\Model\Character;
use App\Model\Room;
use App\Model\RoomCharacter;
use App\Model\RoomLog;
use App\Model\UserCharacter;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class RoomController
{
    /**
     * ルーム一覧を取得
     */
    public function list()
    {
        try {
            $rooms = Room::with([
                'hostUser' => function ($query) {
                    $query->select('id', 'name', 'photoUrl');
                },
                'guestUser' => function ($query) {
                    $query->select('id', 'name', 'photoUrl');
                }
            ])->get();

            $rooms->transform(function ($room) {
                return [
                    'id' => $room->id,
                    'host_user' => $room->hostUser ? [
                        'id' => $room->hostUser->id,
                        'name' => $room->hostUser->name,
                        'photoUrl' => $room->hostUser->photoUrl,
                    ] : null,
                    'guest_user' => $room->guestUser ? [
                        'id' => $room->guestUser->id,
                        'name' => $room->guestUser->name,
                        'photoUrl' => $room->guestUser->photoUrl,
                    ] : null,
                    'status' => $room->status
                ];
            });

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
            $characterIdList = $request->characterIdList;

            if (empty($characterIdList)) {
                return response()->json(['message' => 'キャラクターIDリストが必要です'], 400);
            }

            // 既存のルームをチェック
            $existingRoom = Room::where('hostUserId', $request->hostUserId)
                ->first();

            if ($existingRoom) {
                return response()->json(['message' => '既に作成されたルームが存在します'], 409);
            }

            $room = DB::transaction(function () use ($request, $characterIdList) {
                $room = Room::create([
                    'id' => Str::uuid(),
                    'hostUserId' => $request->hostUserId,
                    'guestUserId' => null,
                    'status' => 'waiting',
                ]);

                // キャラクター名を取得
                $characterNames = [];
                foreach ($characterIdList as $characterId) {
                    $character = Character::find($characterId);

                    if (!$character) {
                        throw new Exception("Character {$characterId} not found", 404);
                    }

                    $userCharacter = UserCharacter::where('userId', $request->hostUserId)
                        ->where('characterId', $characterId)
                        ->first();

                    if (!$userCharacter) {
                        throw new Exception("UserCharacter not found", 404);
                    }

                    $characterNames[] = $character->name;
                }

                // 基本倍率（パーティ全体用）
                $powerMultiplier = 1.0;
                $speedMultiplier = 1.0;
                // $defenseMultiplier = 1.0;
                $lifeMultiplier = 1.0;

                // パーティ全体の組み合わせボーナス
                if (!array_diff(['html', 'css', 'javascript'], $characterNames)) {
                    $powerMultiplier = 3;  // powerを20%増
                    $speedMultiplier = 3;  // speedを10%増
                } elseif (!array_diff(['react', 'vue', 'angular'], $characterNames)) {
                    $powerMultiplier = 5;   // powerを10%増
                    // $defenseMultiplier = 6; // defenseを30%増
                    $lifeMultiplier = 5;
                }

                // AとBが揃っているかチェック
                $hasA = in_array('A', $characterNames);
                $hasB = in_array('B', $characterNames);
                $shouldBoostB = $hasA && $hasB;

                // RoomCharacterの作成
                foreach ($characterIdList as $characterId) {
                    $character = Character::find($characterId);
                    $userCharacter = UserCharacter::where('userId', $request->hostUserId)
                        ->where('characterId', $characterId)
                        ->first();

                    // 個別倍率（パーティ全体の倍率をベースに調整）
                    $specificPowerMultiplier = $powerMultiplier;
                    $specificSpeedMultiplier = $speedMultiplier;
                    // $specificDefenseMultiplier = $defenseMultiplier;
                    $specificLifeMultiplier = $lifeMultiplier;

                    // AがいてAとBが揃った場合、Bのステータスをさらに向上
                    if ($shouldBoostB && $character->name === 'B') {
                        $specificPowerMultiplier *= 1.2;  // Bのpowerをさらに20%増
                        $specificSpeedMultiplier *= 1.15; // Bのspeedをさらに15%増
                    }

                    RoomCharacter::create([
                        'roomId' => $room->id,
                        'characterId' => $characterId,
                        'userId' => $room->hostUserId,
                        'level' => $userCharacter->level,
                        'life' => $userCharacter->life * $specificLifeMultiplier,
                        'maxLife' => $userCharacter->life * $specificLifeMultiplier,
                        'power' => $userCharacter->power * $specificPowerMultiplier,
                        'speed' => $userCharacter->speed * $specificSpeedMultiplier,
                        'evasion' => $character->base_evasion,
                    ]);
                }

                return $room;
            });

            return response()->json($room, 201);
        } catch (Exception $e) {
            $statusCode = $e->getCode() === 404 ? 404 : 500;
            return response()->json(['message' => $e->getMessage()], $statusCode);
        }
    }

    /**
     * ルームに参加
     */
    public function join(Request $request)
    {
        try {
            DB::beginTransaction();

            $room = Room::with([
                'hostUser' => function ($query) {
                    $query->select('id', 'name', 'photoUrl');
                },
                'guestUser' => function ($query) {
                    $query->select('id', 'name', 'photoUrl');
                }
            ])->where('id', $request->roomId)->first();

            if (!$room) {
                return response()->json(['message' => '指定されたルームが見つかりません'], 404);
            }

            if ($room->status !== 'waiting') {
                return response()->json(['message' => 'このルームには参加できません'], 400);
            }

            if ($room->guestUserId) {
                return response()->json(['message' => 'このルームにはすでにゲストが参加しています'], 400);
            }

            $characterIdList = $request->characterIdList;
            if (empty($characterIdList)) {
                return response()->json(['message' => 'キャラクターIDリストが必要です'], 400);
            }

            $room->update([
                'guestUserId' => $request->guestUserId,
                'status' => 'pending',
            ]);

            foreach ($characterIdList as $characterId) {
                $character = Character::find($characterId);
                if (!$character) {
                    throw new Exception("Character {$characterId} not found", 404);
                }

                $userCharacter = UserCharacter::where('userId', $room->guestUserId)
                    ->where('characterId', $characterId)
                    ->first();
                if (!$userCharacter) {
                    throw new Exception("UserCharacter not found", 404);
                }

                RoomCharacter::create([
                    'roomId' => $room->id,
                    'characterId' => $characterId,
                    'userId' => $room->guestUserId,
                    'level' => $userCharacter->level,
                    'life' => $userCharacter->life,
                    'maxLife' => $userCharacter->life,
                    'power' => $userCharacter->power,
                    'speed' => $userCharacter->speed,
                    'evasion' => $character->base_evasion,
                ]);
            }

            DB::commit();

            $room->load([
                'hostUser' => function ($query) {
                    $query->select('id', 'name', 'photoUrl');
                },
                'guestUser' => function ($query) {
                    $query->select('id', 'name', 'photoUrl');
                }
            ]);

            $response = [
                'id' => $room->id,
                'host_user' => $room->hostUser ? [
                    'id' => $room->hostUser->id,
                    'name' => $room->hostUser->name,
                    'photoUrl' => $room->hostUser->photoUrl,
                ] : null,
                'guest_user' => $room->guestUser ? [
                    'id' => $room->guestUser->id,
                    'name' => $room->guestUser->name,
                    'photoUrl' => $room->guestUser->photoUrl,
                ] : null,
                'status' => $room->status,
            ];

            return response()->json($response, 200);
        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 500);
        }
    }

    /**
     * ルームへの参加申請を承認
     */
    public function approve(Request $request)
    {
        try {
            $roomId = $request->route('roomId');
            $userId = $request->route('userId');

            $room = Room::where('id', $roomId)->first();

            if (!$room) {
                return response()->json(['message' => 'ルームが見つかりません'], 404);
            }

            if ($room->hostUserId !== $userId) {
                return response()->json(['message' => '承認の権限がありません'], 403);
            }

            if ($room->status !== 'pending') {
                return response()->json(['message' => '現在承認を受け付けていません'], 400);
            }
            if (!$room->guestUserId) {
                return response()->json(['message' => 'ゲストが申請していません'], 400);
            }

            DB::transaction(function () use ($roomId, $room) {
                // 自分（ホスト）と味方（ゲスト）のキャラクター一覧を取得
                $hostCharacters = RoomCharacter::where('roomId', $roomId)
                    ->where('userId', $room->hostUserId)
                    ->with('character') // Characterモデルとのリレーション
                    ->get();

                $guestCharacters = $room->guestUserId
                    ? RoomCharacter::where('roomId', $roomId)
                        ->where('userId', $room->guestUserId)
                        ->with('character')
                        ->get()
                    : [];

                // ホストのキャラクター名でステータス向上処理
                $hostCharacterNames = $hostCharacters->pluck('character.name')->toArray();
                if (!array_diff(['Warrior', 'Mage', 'Healer'], $hostCharacterNames)) {
                    RoomCharacter::where('roomId', $roomId)
                        ->where('userId', $room->hostUserId)
                        ->update([
                            'power' => DB::raw('power * 1.2'),  // powerを20%増
                            'speed' => DB::raw('speed * 1.1')   // speedを10%増
                        ]);
                } elseif (!array_diff(['Knight', 'Wizard', 'Priest'], $hostCharacterNames)) {
                    RoomCharacter::where('roomId', $roomId)
                        ->where('userId', $room->hostUserId)
                        ->update([
                            'power' => DB::raw('power * 1.1'),   // powerを10%増
                            'evasion' => DB::raw('evasion * 1.3') // defenseを30%増
                        ]);
                }

                // ゲストのキャラクター名でステータス向上処理
                $guestCharacterNames = $guestCharacters->pluck('character.name')->toArray();
                if (!array_diff(['Archer', 'Tank', 'Support'], $guestCharacterNames)) {
                    RoomCharacter::where('roomId', $roomId)
                        ->where('userId', $room->guestUserId)
                        ->update([
                            'speed' => DB::raw('speed * 1.25'), // speedを25%増
                            'power' => DB::raw('power * 1.15')  // powerを15%増
                        ]);
                } elseif (!array_diff(['Rogue', 'Berserker', 'Cleric'], $guestCharacterNames)) {
                    RoomCharacter::where('roomId', $roomId)
                        ->where('userId', $room->guestUserId)
                        ->update([
                            'evasion' => DB::raw('evasion * 1.2'), // defenseを20%増
                            'maxLife' => DB::raw('hp * 1.2')           // hpを20%増
                        ]);
                }

                RoomCharacter::where('roomId', $roomId)->update(['isActive' => true]);

                $characters = RoomCharacter::where('roomId', $roomId)
                    ->orderBy('speed', 'desc')
                    ->get();

                if ($characters->isEmpty()) {
                    throw new Exception('ルームにキャラクターが存在しません');
                }

                $firstTurn = $characters->first();
                if (!$firstTurn->userId) {
                    throw new Exception('最初のターンユーザーIDがnullです');
                }

                $room->update([
                    'status' => 'battling',
                    'currentTurnUserId' => $firstTurn->userId,
                    'currentTurnCharacterId' => $firstTurn->characterId
                ]);
            });

            $room->refresh();

            return response()->json([
                'message' => '参加申請が承認されました',
                'room' => $room
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => '承認処理に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 次のターンに進む
     */
    public function nextTurn(Request $request)
    {
        try {
            $roomId = $request->route('roomId');
            $userId = $request->route('userId'); // 現在の行動ユーザー

            $room = Room::where('id', $roomId)->first();

            if (!$room || $room->status !== 'battling') {
                return response()->json(['message' => 'バトルが進行中ではありません'], 400);
            }

            if ($room->currentTurnUserId !== $userId) {
                return response()->json(['message' => 'あなたのターンではありません'], 403);
            }

            return DB::transaction(function () use ($roomId, $userId, $room) {
                // 現在のユーザーの最速キャラクターを行動不能に
                RoomCharacter::where('roomId', $roomId)
                    ->where('userId', $userId)
                    ->where('isActive', true)
                    ->orderBy('speed', 'desc')
                    ->limit(1)
                    ->update(['isActive' => false]);

                $nextTurn = RoomCharacter::where('roomId', $roomId)
                    ->where('isActive', true)
                    ->orderBy('speed', 'desc')
                    ->first();

                if (!$nextTurn) {
                    RoomCharacter::where('roomId', $roomId)->update(['isActive' => true]);
                    $nextTurn = RoomCharacter::where('roomId', $roomId)
                        ->where('isActive', true)
                        ->orderBy('speed', 'desc')
                        ->first();
                }

                $room->update(['currentTurnUserId' => $nextTurn->userId, 'currentTurnCharacterId' => $nextTurn->characterId]);

                return response()->json([
                    'message' => '次のターンに進みました',
                    'room' => $room,
                    'next_turn_user_id' => $nextTurn->userId
                ], 200);
            });
        } catch (Exception $e) {
            return response()->json([
                'message' => 'ターン進行に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ルームへの参加申請を拒否
     */
    public function reject(Request $request)
    {
        try {
            $roomId = $request->route('roomId');
            $userId = $request->route('userId');

            $room = Room::where('id', $roomId)->first();

            if (!$room) {
                return response()->json(['message' => 'ルームが見つかりません'], 404);
            }

            if ($room->hostUserId !== $userId) {
                return response()->json(['message' => '拒否の権限がありません'], 403);
            }

            if ($room->status !== 'pending') {
                return response()->json(['message' => '現在拒否を受け付けていません'], 400);
            }
            if (!$room->guestUserId) {
                return response()->json(['message' => 'ゲストが申請していません'], 400);
            }

            DB::transaction(function () use ($room) {
                // 更新前にguestUserIdを取得
                $guestUserId = $room->guestUserId;

                // guestUserIdに紐づくRoomCharacterを削除
                RoomCharacter::where('roomId', $room->id)
                    ->where('userId', $guestUserId)
                    ->delete();

                // ルームの更新
                $room->update([
                    'status' => 'waiting',
                    'guestUserId' => null
                ]);
            });

            $room->refresh();

            return response()->json([
                'message' => '参加申請が拒否されました',
                'room' => $room
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => '拒否処理に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * キャラクターが別のキャラクターに攻撃する
     */
    public function attack(Request $request)
    {
        try {
            $roomId = $request->route('roomId');
            $userId = $request->route('userId');
            $targetCharacterId = $request->targetCharacterId; // RoomCharacterのid

            $room = Room::where('id', $roomId)->first();

            if (!$room || $room->status !== 'battling') {
                return response()->json(['message' => 'バトルが進行中ではありません'], 400);
            }

            if ($room->currentTurnUserId !== $userId) {
                return response()->json(['message' => 'あなたのターンではありません'], 403);
            }

            return DB::transaction(function () use ($roomId, $userId, $targetCharacterId, $room) {
                // 現在の行動キャラクターを取得
                $attacker = RoomCharacter::where('roomId', $roomId)
                    ->where('userId', $userId)
                    ->where('characterId', $room->currentTurnCharacterId)
                    ->where('isActive', true)
                    ->first();

                if (!$attacker) {
                    throw new Exception('行動可能なキャラクターが見つかりません');
                }

                // 攻撃対象を取得（相手側のuserIdを考慮）
                $target = RoomCharacter::where('roomId', $roomId)
                    ->where('id', $targetCharacterId)
                    ->where('userId', '!=', $userId) // 自分以外のキャラクターに限定
                    ->first();

                if (!$target) {
                    throw new Exception('攻撃対象のキャラクターが見つかりません');
                }

                if ($target->life <= 0) {
                    throw new Exception('対象キャラクターは既に倒されています');
                }

                // 回避
                $damage = max(0, $attacker->power);
                $newLife = max(0, $target->life - $damage);

                // ログを記録
                // RoomLog::create([
                //     'roomId' => $roomId,
                //     'actionType' => 'attack',
                //     'actorUserId' => $attacker->userId,
                //     'actorCharacterId' => $attacker->id,
                //     'targetUserId' => $target->userId,
                //     'targetCharacterId' => $target->id,
                //     'value' => $damage,
                //     'description' => "キャラクター {$attacker->id} が キャラクター {$target->id} に {$damage} ダメージを与えました",
                // ]);

                // 対象のライフを更新
                $target->update(['life' => $newLife]);

                // 行動済みにする
                $attacker->update(['isActive' => false]);

                // 次のターンへ
                $nextTurn = RoomCharacter::where('roomId', $roomId)
                    ->where('isActive', true)
                    ->orderBy('speed', 'desc')
                    ->first();

                if (!$nextTurn) {
                    RoomCharacter::where('roomId', $roomId)->update(['isActive' => true]);
                    $nextTurn = RoomCharacter::where('roomId', $roomId)
                        ->where('isActive', true)
                        ->orderBy('speed', 'desc')
                        ->first();

                    // ターンリセットのログ
                    // RoomLog::create([
                    //     'roomId' => $roomId,
                    //     'actionType' => 'turnReset',
                    //     'actorUserId' => null,
                    //     'actorCharacterId' => null,
                    //     'targetUserId' => null,
                    //     'targetCharacterId' => null,
                    //     'value' => null,
                    //     'description' => 'ターンがリセットされました',
                    // ]);
                }

                $room->update([
                    'currentTurnUserId' => $nextTurn->userId,
                    'currentTurnCharacterId' => $nextTurn->characterId
                ]);

                $room->refresh();

                return response()->json([
                    'message' => "キャラクター {$attacker->id} が キャラクター {$target->id} に {$damage} ダメージを与えました",
                    'room' => $room,
                    'attacker' => $attacker,
                    'target' => [
                        'id' => $target->id,
                        'userId' => $target->userId,
                        'life' => $newLife
                    ],
                    'next_turn_user_id' => $nextTurn->userId,
                    'next_turn_character_id' => $nextTurn->characterId
                ], 200);
            });
        } catch (Exception $e) {
            return response()->json([
                'message' => '攻撃処理に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ルーム情報を取得
     */
    public function status(Request $request)
    {
        try {
            $userId = $request->route('userId');
            $roomId = $request->route('roomId');

            if (!$userId)  return response()->json(['message' => 'ユーザーIDが必要です'], 401);
            if (!$roomId)  return response()->json(['message' => 'ルームIDが必要です'], 401);

            $room = Room::with(['roomCharacter.character']) // ルームに紐づくキャラ情報を取得
                        ->where('id', $roomId)
                        ->first();

            if (!$room) {
                return response()->json([
                    'message' => '指定されたルームが見つかりません',
                ], 404);
            }

            // 権限チェック (hostUserId もしくは guestUserId のみ許可)
            if ($room->hostUserId !== $userId && $room->guestUserId !== $userId) {
                return response()->json([
                    'message' => 'このルームにアクセスする権限がありません',
                ], 403);
            }

            return response()->json($room, 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve room',
                'error' => $e->getMessage(),
            ], 500);
        }
    }



    // public function startBattle(Request $request)
    // {
    //     try {
    //         $roomId = $request->roomId;
    //         $userId = $request->userId;

    //         $room = Room::where('id', $roomId)->first();

    //         if (!$room) return response()->json(['message' => 'ルームが見つかりません'], 404);

    //         // リクエストしたユーザーがホストであることを確認
    //         if ($room->hostUserId !== $userId) {
    //             return response()->json([
    //                 'message' => 'バトル開始の権限がありません',
    //             ], 403);
    //         }

    //         // ルームの状態が `waiting` であることを確認
    //         if ($room->status !== 'waiting') {
    //             return response()->json([
    //                 'message' => 'バトルを開始できる状態ではありません',
    //             ], 400);
    //         }

    //         // バトル開始（status を `battling` に更新）
    //         $room->update(['status' => 'battling']);

    //         return response()->json($room, 200);
    //     } catch (Exception $e) {
    //         return response()->json([
    //             'message' => 'バトル開始に失敗しました',
    //             'error' => $e->getMessage(),
    //         ], 500);
    //     }
    // }

    // public function processAction(Request $request)
    // {
    //     try {
    //         $roomId = $request->input('roomId');
    //         $userId = $request->input('userId');
    //         $command = $request->input('command'); // "attack" or "defend"

    //         $room = Room::where('id', $roomId)->first();

    //         if (!$room || $room->status !== 'battling') {
    //             return response()->json(['message' => 'バトルが進行中ではありません'], 400);
    //         }

    //         if ($room->currentTurnUserId !== $userId) {
    //             return response()->json(['message' => 'あなたのターンではありません'], 403);
    //         }

    //         // ターンを切り替える
    //         $nextTurnUserId = $room->hostUserId === $userId ? $room->guestUserId : $room->hostUserId;
    //         $room->update(['currentTurnUserId' => $nextTurnUserId, ]);

    //         return response()->json(['message' => "{$userId} が {$command} を選択しました", 'room' => $room], 200);
    //     } catch (\Exception $e) {
    //         return response()->json(['message' => '処理に失敗しました', 'error' => $e->getMessage()], 500);
    //     }
    // }

    // public function endBattle(Request $request)
    // {
    //     try {
    //         $roomId = $request->input('roomId');
    //         $winner = $request->input('winner'); // "host" or "guest"

    //         // ルームを取得
    //         $room = Room::where('id', $roomId)->first();

    //         if (!$room) {
    //             return response()->json([
    //                 'message' => 'ルームが見つかりません',
    //             ], 404);
    //         }

    //         // ルームの状態が `battling` でなければ処理しない
    //         if ($room->status !== 'battling') {
    //             return response()->json([
    //                 'message' => 'バトルが進行中ではありません',
    //             ], 400);
    //         }

    //         // 勝者を保存（勝者のユーザーIDを設定）
    //         $winnerUserId = $winner === 'host' ? $room->hostUserId : $room->guestUserId;
    //         $room->update([
    //             'status' => 'finished',
    //             'winnerId' => $winnerUserId, // 勝者のIDを記録（`rooms` テーブルに `winnerId` カラムが必要）
    //         ]);

    //         return response()->json([
    //             'message' => 'バトル結果が保存されました',
    //             'room' => $room,
    //         ], 200);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'message' => 'バトル結果の保存に失敗しました',
    //             'error' => $e->getMessage(),
    //         ], 500);
    //     }
    // }

    /**
     * ルームを全て削除（テスト用）
     */
    public function allDelete()
    {
        try {
            DB::beginTransaction();

            $deletedCount = Room::query()->delete();

            DB::commit();

            return response()->json([
                'message' => 'All rooms deleted successfully',
                'deleted_count' => $deletedCount
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to delete rooms',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

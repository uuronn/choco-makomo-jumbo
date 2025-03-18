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

            $existingRoom = Room::where('hostUserId', $request->hostUserId)->first();
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

                $powerMultiplier = 1.0;
                $speedMultiplier = 1.0;
                $lifeMultiplier = 1.0;

                // パーティ全体の組み合わせボーナス
                if (!array_diff(['html', 'CSS', 'javascript'], $characterNames)) {
                    $powerMultiplier = 3;
                    $speedMultiplier = 3;
                    RoomLog::create([
                        'roomId' => $room->id,
                        'actionType' => 'partyBonus',
                        'actorUserId' => $request->hostUserId,
                        'actorCharacterId' => null,
                        'targetUserId' => null,
                        'targetCharacterId' => null,
                        'value' => null,
                        'description' => "ホストのパーティ ['html', 'CSS', 'javascript'] で power と speed が3倍に向上",
                    ]);
                } elseif (!array_diff(['react', 'vue', 'angular'], $characterNames)) {
                    $powerMultiplier = 5;
                    $lifeMultiplier = 5;
                    RoomLog::create([
                        'roomId' => $room->id,
                        'actionType' => 'partyBonus',
                        'actorUserId' => $request->hostUserId,
                        'actorCharacterId' => null,
                        'targetUserId' => null,
                        'targetCharacterId' => null,
                        'value' => null,
                        'description' => "ホストのパーティ ['react', 'vue', 'angular'] で power と life が5倍に向上",
                    ]);
                }

                $hasA = in_array('A', $characterNames);
                $hasB = in_array('B', $characterNames);
                $shouldBoostB = $hasA && $hasB;

                foreach ($characterIdList as $characterId) {
                    $character = Character::find($characterId);
                    $userCharacter = UserCharacter::where('userId', $request->hostUserId)
                        ->where('characterId', $characterId)
                        ->first();

                    $specificPowerMultiplier = $powerMultiplier;
                    $specificSpeedMultiplier = $speedMultiplier;
                    $specificLifeMultiplier = $lifeMultiplier;

                    if ($shouldBoostB && $character->name === 'B') {
                        $specificPowerMultiplier *= 1.2;
                        $specificSpeedMultiplier *= 1.15;
                        RoomLog::create([
                            'roomId' => $room->id,
                            'actionType' => 'characterBonus',
                            'actorUserId' => $request->hostUserId,
                            'actorCharacterId' => $characterId,
                            'targetUserId' => null,
                            'targetCharacterId' => null,
                            'value' => null,
                            'description' => "キャラクター 'B' の power が20%増、speed が15%増",
                        ]);
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

            $characterNames = [];
            foreach ($characterIdList as $characterId) {
                $character = Character::find($characterId);
                if (!$character) {
                    throw new Exception("Character {$characterId} not found", 404);
                }

                $userCharacter = UserCharacter::where('userId', $request->guestUserId)
                    ->where('characterId', $characterId)
                    ->first();
                if (!$userCharacter) {
                    throw new Exception("UserCharacter not found", 404);
                }

                $characterNames[] = $character->name;
            }

            $powerMultiplier = 1.0;
            $speedMultiplier = 1.0;
            $lifeMultiplier = 1.0;

            if (!array_diff(['html', 'CSS', 'javascript'], $characterNames)) {
                $powerMultiplier = 3;
                $speedMultiplier = 3;
                RoomLog::create([
                    'roomId' => $room->id,
                    'actionType' => 'partyBonus',
                    'actorUserId' => $request->guestUserId,
                    'actorCharacterId' => null,
                    'targetUserId' => null,
                    'targetCharacterId' => null,
                    'value' => null,
                    'description' => "ゲストのパーティ ['html', 'CSS', 'javascript'] で power と speed が3倍に向上",
                ]);
            } elseif (!array_diff(['react', 'vue', 'angular'], $characterNames)) {
                $powerMultiplier = 5;
                $lifeMultiplier = 5;
                RoomLog::create([
                    'roomId' => $room->id,
                    'actionType' => 'partyBonus',
                    'actorUserId' => $request->guestUserId,
                    'actorCharacterId' => null,
                    'targetUserId' => null,
                    'targetCharacterId' => null,
                    'value' => null,
                    'description' => "ゲストのパーティ ['react', 'vue', 'angular'] で power と life が5倍に向上",
                ]);
            }

            $hasA = in_array('A', $characterNames);
            $hasB = in_array('B', $characterNames);
            $shouldBoostB = $hasA && $hasB;

            foreach ($characterIdList as $characterId) {
                $character = Character::find($characterId);
                $userCharacter = UserCharacter::where('userId', $request->guestUserId)
                    ->where('characterId', $characterId)
                    ->first();

                $specificPowerMultiplier = $powerMultiplier;
                $specificSpeedMultiplier = $speedMultiplier;
                $specificLifeMultiplier = $lifeMultiplier;

                if ($shouldBoostB && $character->name === 'B') {
                    $specificPowerMultiplier *= 1.2;
                    $specificSpeedMultiplier *= 1.15;
                    RoomLog::create([
                        'roomId' => $room->id,
                        'actionType' => 'characterBonus',
                        'actorUserId' => $request->guestUserId,
                        'actorCharacterId' => $characterId,
                        'targetUserId' => null,
                        'targetCharacterId' => null,
                        'value' => null,
                        'description' => "キャラクター 'B' の power が20%増、speed が15%増",
                    ]);
                }

                RoomCharacter::create([
                    'roomId' => $room->id,
                    'characterId' => $characterId,
                    'userId' => $request->guestUserId,
                    'level' => $userCharacter->level,
                    'life' => $userCharacter->life * $specificLifeMultiplier,
                    'maxLife' => $userCharacter->life * $specificLifeMultiplier,
                    'power' => $userCharacter->power * $specificPowerMultiplier,
                    'speed' => $userCharacter->speed * $specificSpeedMultiplier,
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
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 500);
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
                $hostCharacters = RoomCharacter::where('roomId', $roomId)
                    ->where('userId', $room->hostUserId)
                    ->with('character')
                    ->get();

                $guestCharacters = $room->guestUserId
                    ? RoomCharacter::where('roomId', $roomId)
                        ->where('userId', $room->guestUserId)
                        ->with('character')
                        ->get()
                    : [];

                $hostCharacterNames = $hostCharacters->pluck('character.name')->toArray();
                if (!array_diff(['Warrior', 'Mage', 'Healer'], $hostCharacterNames)) {
                    RoomCharacter::where('roomId', $roomId)
                        ->where('userId', $room->hostUserId)
                        ->update([
                            'power' => DB::raw('power * 1.2'),
                            'speed' => DB::raw('speed * 1.1')
                        ]);
                    RoomLog::create([
                        'roomId' => $roomId,
                        'actionType' => 'partyBonus',
                        'actorUserId' => $room->hostUserId,
                        'actorCharacterId' => null,
                        'targetUserId' => null,
                        'targetCharacterId' => null,
                        'value' => null,
                        'description' => "ホストのパーティ ['Warrior', 'Mage', 'Healer'] で power が20%増、speed が10%増",
                    ]);
                } elseif (!array_diff(['Knight', 'Wizard', 'Priest'], $hostCharacterNames)) {
                    RoomCharacter::where('roomId', $roomId)
                        ->where('userId', $room->hostUserId)
                        ->update([
                            'power' => DB::raw('power * 1.1'),
                            'evasion' => DB::raw('evasion * 1.3')
                        ]);
                    RoomLog::create([
                        'roomId' => $roomId,
                        'actionType' => 'partyBonus',
                        'actorUserId' => $room->hostUserId,
                        'actorCharacterId' => null,
                        'targetUserId' => null,
                        'targetCharacterId' => null,
                        'value' => null,
                        'description' => "ホストのパーティ ['Knight', 'Wizard', 'Priest'] で power が10%増、evasion が30%増",
                    ]);
                }

                $guestCharacterNames = $guestCharacters->pluck('character.name')->toArray();
                if (!array_diff(['Archer', 'Tank', 'Support'], $guestCharacterNames)) {
                    RoomCharacter::where('roomId', $roomId)
                        ->where('userId', $room->guestUserId)
                        ->update([
                            'speed' => DB::raw('speed * 1.25'),
                            'power' => DB::raw('power * 1.15')
                        ]);
                    RoomLog::create([
                        'roomId' => $roomId,
                        'actionType' => 'partyBonus',
                        'actorUserId' => $room->guestUserId,
                        'actorCharacterId' => null,
                        'targetUserId' => null,
                        'targetCharacterId' => null,
                        'value' => null,
                        'description' => "ゲストのパーティ ['Archer', 'Tank', 'Support'] で speed が25%増、power が15%増",
                    ]);
                } elseif (!array_diff(['Rogue', 'Berserker', 'Cleric'], $guestCharacterNames)) {
                    RoomCharacter::where('roomId', $roomId)
                        ->where('userId', $room->guestUserId)
                        ->update([
                            'evasion' => DB::raw('evasion * 1.2'),
                            'maxLife' => DB::raw('maxLife * 1.2') // hpをmaxLifeに修正
                        ]);
                    RoomLog::create([
                        'roomId' => $roomId,
                        'actionType' => 'partyBonus',
                        'actorUserId' => $room->guestUserId,
                        'actorCharacterId' => null,
                        'targetUserId' => null,
                        'targetCharacterId' => null,
                        'value' => null,
                        'description' => "ゲストのパーティ ['Rogue', 'Berserker', 'Cleric'] で evasion が20%増、maxLife が20%増",
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

                RoomLog::create([
                    'roomId' => $roomId,
                    'actionType' => 'approve',
                    'actorUserId' => $room->hostUserId,
                    'actorCharacterId' => null,
                    'targetUserId' => $room->guestUserId,
                    'targetCharacterId' => null,
                    'value' => null,
                    'description' => "ホストがゲストの参加申請を承認しました",
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
     * ルーム情報を取得
     */
    public function status(Request $request)
    {
        try {
            $userId = $request->route('userId');
            $roomId = $request->route('roomId');

            if (!$userId) return response()->json(['message' => 'ユーザーIDが必要です'], 401);
            if (!$roomId) return response()->json(['message' => 'ルームIDが必要です'], 401);

            $room = Room::with([
                'roomCharacter.character',
                'roomLog' => function ($query) {
                    $query->with([
                        'actorCharacter' => function ($query) {
                            $query->select('id', 'name');
                        },
                        'targetCharacter' => function ($query) {
                            $query->select('id', 'name');
                        }
                    ]);
                }
            ])->where('id', $roomId)->first();

            if (!$room) {
                return response()->json(['message' => '指定されたルームが見つかりません'], 404);
            }

            if ($room->hostUserId !== $userId && $room->guestUserId !== $userId) {
                return response()->json(['message' => 'このルームにアクセスする権限がありません'], 403);
            }

            // $logs = $room->roomLog->map(function ($log) {
            //     return [
            //         'actionType' => $log->actionType,
            //         'actor' => $log->actorCharacter ? [
            //             'id' => $log->actorCharacter->id,
            //             'name' => $log->actorCharacter->name
            //         ] : null,
            //         'target' => $log->targetCharacter ? [
            //             'id' => $log->targetCharacter->id,
            //             'name' => $log->targetCharacter->name
            //         ] : null,
            //         'value' => $log->value,
            //         'description' => $log->description,
            //         'created_at' => $log->created_at
            //     ];
            // });

            return response()->json($room, 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve room',
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
                $attacker = RoomCharacter::where('roomId', $roomId)
                    ->where('userId', $userId)
                    ->where('characterId', $room->currentTurnCharacterId)
                    ->where('isActive', true)
                    ->first();

                if (!$attacker) {
                    throw new Exception('行動可能なキャラクターが見つかりません');
                }

                $target = RoomCharacter::where('roomId', $roomId)
                    ->where('id', $targetCharacterId)
                    ->where('userId', '!=', $userId)
                    ->first();

                if (!$target) {
                    throw new Exception('攻撃対象のキャラクターが見つかりません');
                }

                if ($target->life <= 0) {
                    throw new Exception('対象キャラクターは既に倒されています');
                }

                $damage = max(0, $attacker->power);
                $newLife = max(0, $target->life - $damage);

                RoomLog::create([
                    'roomId' => $roomId,
                    'actionType' => 'attack',
                    'actorUserId' => $attacker->userId,
                    'actorCharacterId' => $attacker->characterId, // CharacterのID
                    'targetUserId' => $target->userId,
                    'targetCharacterId' => $target->characterId,  // CharacterのID
                    'value' => $damage,
                    'description' => "キャラクター {$attacker->characterId} が キャラクター {$target->characterId} に {$damage} ダメージを与えました",
                ]);

                $target->update(['life' => $newLife]);
                $attacker->update(['isActive' => false]);

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

                    RoomLog::create([
                        'roomId' => $roomId,
                        'actionType' => 'turnReset',
                        'actorUserId' => null,
                        'actorCharacterId' => null,
                        'targetUserId' => null,
                        'targetCharacterId' => null,
                        'value' => null,
                        'description' => 'ターンがリセットされました',
                    ]);
                }

                $room->update([
                    'currentTurnUserId' => $nextTurn->userId,
                    'currentTurnCharacterId' => $nextTurn->characterId
                ]);

                // 終了条件のチェック
                $hostCharacters = RoomCharacter::where('roomId', $roomId)
                    ->where('userId', $room->hostUserId)
                    ->get();
                $guestCharacters = RoomCharacter::where('roomId', $roomId)
                    ->where('userId', $room->guestUserId)
                    ->get();

                $hostAlive = $hostCharacters->where('life', '>', 0)->count() > 0;
                $guestAlive = $guestCharacters->where('life', '>', 0)->count() > 0;

                if (!$hostAlive || !$guestAlive) {
                    $room->update(['status' => 'finish']);
                    RoomLog::create([
                        'roomId' => $roomId,
                        'actionType' => 'finish',
                        'actorUserId' => null,
                        'actorCharacterId' => null,
                        'targetUserId' => null,
                        'targetCharacterId' => null,
                        'value' => null,
                        'description' => !$hostAlive ? "ホスト側が全滅し、バトルが終了しました" : "ゲスト側が全滅し、バトルが終了しました",
                    ]);
                }

                $room->refresh();

                return response()->json([
                    'message' => "キャラクター {$attacker->characterId} が キャラクター {$target->characterId} に {$damage} ダメージを与えました",
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
     * 特定のルームを削除
     */
    public function delete(Request $request)
    {
        try {
            $roomId = $request->route('roomId');
            $userId = $request->route('userId');

            // ルームを取得
            $room = Room::where('id', $roomId)->first();

            if (!$room) {
                return response()->json(['message' => 'ルームが見つかりません'], 404);
            }

            // 削除権限の確認（ホストのみが削除可能）
            if ($room->hostUserId !== $userId) {
                return response()->json(['message' => 'ルームを削除する権限がありません'], 403);
            }

            // トランザクション内で削除
            DB::transaction(function () use ($room) {
                // 関連データの削除（必要に応じて）
                RoomCharacter::where('roomId', $room->id)->delete();
                // RoomLog::where('roomId', $room->id)->delete();

                // ルーム自体の削除
                $room->delete();

                // 削除ログ（オプション）
                // ※削除後にログを残す場合は別のテーブルに保存する必要あり
            });

            return response()->json([
                'message' => "ルーム {$room->id} が正常に削除されました"
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'ルームの削除に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }

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

<?php

namespace App\Http\Controllers;

use App\Model\Character;
use App\Model\Room;
use App\Model\RoomCharacter;
use App\Model\RoomLog;
use App\Model\User;
use App\Model\UserCharacter;
use App\Service\PartyBonusManager;
use App\Service\PassiveSkillManager;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RoomController
{
    /**
     * ルームを承認し、戦闘を開始する
     * @param int $roomId ルームID
     * @return void
     */
    public function approveManually($roomId)
    {
        $room = Room::findOrFail($roomId);
        if ($room->status !== 'waiting') {
            throw new \Exception('ルームが待機状態ではありません。');
        }

        // パーティスキルを適用
        $partyBonusLogs = PartyBonusManager::applyBonuses($room);
        foreach ($partyBonusLogs as $log) {
            RoomLog::create($log);
        }

        // ルームステータスを戦闘中に更新
        $room->update(['status' => 'in_battle']);

        // 戦闘開始ログ
        RoomLog::create([
            'roomId' => $room->id,
            'characterId' => null,
            'userId' => null,
            'description' => '戦闘が開始されました。',
        ]);
    }

    /**
     * CPUの行動処理
     */
    public function cpuAct(Request $request, $roomId)
    {
        try {
            $room = Room::with(['hostUser', 'guestUser'])->where('id', $roomId)->first();

            if (!$room) {
                return response()->json(['message' => 'ルームが見つかりません'], 404);
            }

            if ($room->currentTurnUserId !== '00000000-0000-0000-0000-000000000cpu') {
                return response()->json(['message' => '現在はCPUのターンではありません'], 403);
            }

            $attacker = RoomCharacter::with('character')
                ->where('roomId', $roomId)
                ->where('userId', $room->currentTurnUserId)
                ->where('characterId', $room->currentTurnCharacterId)
                ->where('isActive', true)
                ->where('isDead', false)
                ->first();

            $target = RoomCharacter::with('character')
                ->where('roomId', $roomId)
                ->where('userId', '!=', $room->currentTurnUserId)
                ->where('isDead', false)
                ->inRandomOrder()
                ->first();

            if (!$attacker || !$target) {
                return response()->json(['message' => '攻撃者または対象が見つかりません'], 404);
            }

            $damage = $attacker->power;
            $newLife = max(0, $target->life - $damage);
            $target->update([
                'life' => $newLife,
                'isDead' => $newLife <= 0
            ]);

            // ログ記録
            RoomLog::create([
                'roomId' => $roomId,
                'actionType' => 'attack',
                'actorUserId' => $attacker->userId,
                'actorCharacterId' => $attacker->characterId,
                'targetUserId' => $target->userId,
                'targetCharacterId' => $target->characterId,
                'value' => $damage,
                'description' => "{$attacker->character->name}（CPU）が {$target->character->name} に {$damage} ダメージ",
            ]);

            if ($newLife <= 0) {
                RoomLog::create([
                    'roomId' => $roomId,
                    'actionType' => 'death',
                    'targetUserId' => $target->userId,
                    'targetCharacterId' => $target->characterId,
                    'description' => "{$target->character->name} がダウンしました",
                ]);
            }

            $attacker->update(['isActive' => false]);
            $room->update(['totalTurns' => DB::raw('totalTurns + 1')]);

            $nextTurn = $this->updateNextTurn($roomId);
            $this->checkBattleEnd($room);
            $room->refresh();

            return response()->json([
                'message' => 'CPUが攻撃しました',
                'room' => $room,
                'attacker' => $attacker,
                'target' => [
                    'id' => $target->id,
                    'userId' => $target->userId,
                    'life' => $newLife,
                    'isDead' => $newLife <= 0
                ],
                'next_turn_user_id' => $nextTurn?->userId,
                'next_turn_character_id' => $nextTurn?->characterId,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'CPUの攻撃処理に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * CPUバトルを作成
     */
    public function createCpuBattle(Request $request)
    {
        try {
            $hostUserId = $request->userId;
            $characterIdList = $request->characterIdList;

            if (empty($characterIdList)) {
                return response()->json(['message' => 'キャラクターIDリストが必要です'], 400);
            }

            $cpuUserId = '00000000-0000-0000-0000-000000000cpu';

            // ルーム作成とキャラ登録
            $room = DB::transaction(function () use ($hostUserId, $cpuUserId, $characterIdList) {
                $room = Room::create([
                    'id' => Str::uuid(),
                    'hostUserId' => $hostUserId,
                    'guestUserId' => $cpuUserId,
                    'status' => 'pending',
                    'isCpuBattle' => true,
                ]);

                // ホストのキャラ登録
                foreach ($characterIdList as $characterId) {
                    $userCharacter = UserCharacter::where('userId', $hostUserId)
                        ->where('characterId', $characterId)
                        ->first();
                    if (!$userCharacter) {
                        throw new Exception("ユーザーのキャラクター {$characterId} が見つかりません");
                    }
                    $character = Character::find($characterId);
                    if (!$character) {
                        throw new Exception("キャラクター {$characterId} が見つかりません");
                    }

                    RoomCharacter::create([
                        'roomId' => $room->id,
                        'characterId' => $characterId,
                        'userId' => $hostUserId,
                        'level' => $userCharacter->level,
                        'life' => $userCharacter->life,
                        'maxLife' => $userCharacter->life,
                        'power' => $userCharacter->power,
                        'speed' => $userCharacter->speed,
                        'evasion' => $character->baseEvasion,
                    ]);
                }

                // CPUキャラ選出
                $cpuCharacterIds = Character::inRandomOrder()->limit(3)->pluck('id');
                foreach ($cpuCharacterIds as $characterId) {
                    $character = Character::find($characterId);
                    RoomCharacter::create([
                        'roomId' => $room->id,
                        'characterId' => $character->id,
                        'userId' => $cpuUserId,
                        'level' => 1,
                        'life' => $character->baseLife,
                        'maxLife' => $character->baseLife,
                        'power' => $character->basePower,
                        'speed' => $character->baseSpeed,
                        'evasion' => $character->baseEvasion,
                    ]);
                }

                return $room;
            });

            // 承認処理を手動で呼ぶ
            $this->approveManually($room->id);

            return response()->json($room, 201);
        } catch (Exception $e) {
            return response()->json(['message' => 'CPUバトル作成に失敗しました', 'error' => $e->getMessage()], 500);
        }
    }

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
                'message' => 'ルーム一覧の取得に失敗しました',
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

            $hostUser = User::find($request->hostUserId);
            if (!$hostUser) {
                return response()->json(['message' => 'ホストユーザーが見つかりません'], 404);
            }

            $room = DB::transaction(function () use ($request, $characterIdList, $hostUser) {
                $room = Room::create([
                    'id' => Str::uuid(),
                    'hostUserId' => $request->hostUserId,
                    'guestUserId' => null,
                    'status' => 'waiting',
                ]);

                foreach ($characterIdList as $characterId) {
                    $character = Character::find($characterId);
                    if (!$character) {
                        throw new Exception("キャラクター {$characterId} が見つかりません", 404);
                    }
                    $userCharacter = UserCharacter::where('userId', $request->hostUserId)
                        ->where('characterId', $characterId)
                        ->first();
                    if (!$userCharacter) {
                        throw new Exception("ユーザーのキャラクター {$characterId} が見つかりません", 404);
                    }

                    RoomCharacter::create([
                        'roomId' => $room->id,
                        'characterId' => $characterId,
                        'userId' => $room->hostUserId,
                        'level' => $userCharacter->level,
                        'life' => $userCharacter->life,
                        'maxLife' => $userCharacter->life,
                        'power' => $userCharacter->power,
                        'speed' => $userCharacter->speed,
                        'evasion' => $character->baseEvasion,
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

            $room = Room::with(['hostUser', 'guestUser'])->where('id', $request->roomId)->first();

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

            $guestUser = User::find($request->guestUserId);
            if (!$guestUser) {
                return response()->json(['message' => 'ゲストユーザーが見つかりません'], 404);
            }

            $room->update([
                'guestUserId' => $request->guestUserId,
                'status' => 'pending',
            ]);

            foreach ($characterIdList as $characterId) {
                $character = Character::find($characterId);
                if (!$character) {
                    throw new Exception("キャラクター {$characterId} が見つかりません", 404);
                }
                $userCharacter = UserCharacter::where('userId', $request->guestUserId)
                    ->where('characterId', $characterId)
                    ->first();
                if (!$userCharacter) {
                    throw new Exception("ユーザーのキャラクター {$characterId} が見つかりません", 404);
                }

                RoomCharacter::create([
                    'roomId' => $room->id,
                    'characterId' => $characterId,
                    'userId' => $request->guestUserId,
                    'level' => $userCharacter->level,
                    'life' => $userCharacter->life,
                    'maxLife' => $userCharacter->life,
                    'power' => $userCharacter->power,
                    'speed' => $userCharacter->speed,
                    'evasion' => $character->baseEvasion,
                ]);
            }

            DB::commit();

            $room->load(['hostUser', 'guestUser']);
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
     * ルーム作成をキャンセル
     */
    public function cancelCreate(Request $request)
    {
        try {
            DB::beginTransaction();

            $room = Room::where('id', $request->roomId)->first();

            if (!$room) {
                return response()->json(['message' => '指定されたルームが見つかりません'], 404);
            }

            if ($room->hostUserId !== $request->hostUserId) {
                return response()->json(['message' => 'キャンセルする権限がありません'], 403);
            }

            if ($room->status !== 'waiting') {
                return response()->json(['message' => '現在キャンセルできません'], 400);
            }

            RoomCharacter::where('roomId', $room->id)->delete();
            $room->delete();

            DB::commit();

            return response()->json(['message' => 'ルーム作成がキャンセルされました'], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    /**
     * ルームへの参加をキャンセル
     */
    public function cancelJoin(Request $request)
    {
        try {
            DB::beginTransaction();

            $room = Room::where('id', $request->roomId)->first();

            if (!$room) {
                return response()->json(['message' => '指定されたルームが見つかりません'], 404);
            }

            if ($room->guestUserId !== $request->guestUserId) {
                return response()->json(['message' => 'キャンセルする権限がありません'], 403);
            }

            if ($room->status !== 'pending') {
                return response()->json(['message' => '現在キャンセルできません'], 400);
            }

            $room->update([
                'guestUserId' => null,
                'status' => 'waiting',
            ]);

            RoomCharacter::where('roomId', $room->id)
                ->where('userId', $request->guestUserId)
                ->delete();

            DB::commit();

            $room->load(['hostUser', 'guestUser']);
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

            $room = Room::with(['hostUser', 'guestUser'])->where('id', $roomId)->first();

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
                // パーティスキルを適用
                $partyBonusLogs = PartyBonusManager::applyBonuses($room);
                foreach ($partyBonusLogs as $log) {
                    RoomLog::create([
                        'roomId' => $roomId,
                        'actionType' => 'partyBonus',
                        'actorUserId' => $log['userId'],
                        'characterId' => $log['characterId'],
                        'description' => $log['description'],
                    ]);
                }

                // 全キャラクターをアクティブに
                RoomCharacter::where('roomId', $roomId)->update(['isActive' => true]);

                // 最初のターンを決定
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
                    'currentTurnCharacterId' => $firstTurn->characterId,
                ]);
            });

            $room->refresh();

            return response()->json([
                'message' => '参加申請が承認されました',
                'room' => $room,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => '承認処理に失敗しました',
                'error' => $e->getMessage(),
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
                'roomCharacter' => function ($query) {
                    $query->orderBy('speed', 'desc')->with('character');
                },
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

            return response()->json($room, 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'ルーム情報の取得に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ルーム内で降参する
     */
    public function surrender(Request $request)
    {
        try {
            $roomId = $request->route('roomId');
            $userId = $request->route('userId');

            $room = Room::with(['roomCharacter', 'hostUser', 'guestUser'])->where('id', $roomId)->first();

            if (!$room) {
                return response()->json(['message' => 'ルームが見つかりません'], 404);
            }

            if ($room->status !== 'battling') {
                return response()->json(['message' => 'バトルが進行中ではありません'], 400);
            }

            if ($room->hostUserId !== $userId && $room->guestUserId !== $userId) {
                return response()->json(['message' => 'このルームにアクセスする権限がありません'], 403);
            }

            return DB::transaction(function () use ($roomId, $userId, $room) {
                RoomCharacter::where('roomId', $roomId)
                    ->where('userId', $userId)
                    ->where('isDead', false)
                    ->update([
                        'life' => 0,
                        'isDead' => true,
                        'isActive' => false,
                    ]);

                $winnerUserId = ($userId === $room->hostUserId) ? $room->guestUserId : $room->hostUserId;
                $loserName = ($userId === $room->hostUserId) ? $room->hostUser->name : $room->guestUser->name;
                $winnerName = ($userId === $room->hostUserId) ? $room->guestUser->name : $room->hostUser->name;

                $room->update([
                    'status' => 'finish',
                    'winUserId' => $winnerUserId,
                    'currentTurnUserId' => null,
                    'currentTurnCharacterId' => null,
                ]);

                RoomLog::create([
                    'roomId' => $roomId,
                    'actionType' => 'surrender',
                    'actorUserId' => $userId,
                    'description' => "{$loserName} が降参しました。{$winnerName} の勝利です。",
                ]);

                $room->refresh();

                return response()->json([
                    'message' => "{$loserName} が降参しました。{$winnerName} の勝利です。",
                    'room' => $room,
                    'winner_user_id' => $winnerUserId,
                ], 200);
            });
        } catch (Exception $e) {
            return response()->json([
                'message' => '降参処理に失敗しました',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * キャラクターが別のキャラクターに通常攻撃する
     */
    public function attack(Request $request)
    {
        try {
            $roomId = $request->route('roomId');
            $userId = $request->route('userId');
            $targetCharacterId = $request->input('targetCharacterId');

            if (!$targetCharacterId) {
                return response()->json(['message' => '攻撃対象を指定してください'], 400);
            }

            $room = Room::with(['hostUser', 'guestUser', 'roomCharacter' => function ($query) {
                $query->with('character');
            }])->where('id', $roomId)->first();

            if (!$room || $room->status !== 'battling') {
                return response()->json(['message' => 'バトルが進行中ではありません'], 400);
            }

            if ($room->currentTurnUserId !== $userId) {
                return response()->json(['message' => 'あなたのターンではありません'], 403);
            }

            return DB::transaction(function () use ($roomId, $userId, $targetCharacterId, $room) {
                $attacker = RoomCharacter::with('character')
                    ->where('roomId', $roomId)
                    ->where('userId', $userId)
                    ->where('characterId', $room->currentTurnCharacterId)
                    ->where('isActive', true)
                    ->where('isDead', false)
                    ->first();

                if (!$attacker) {
                    throw new Exception('行動可能なキャラクターが見つかりません');
                }

                $target = RoomCharacter::with('character')
                    ->where('roomId', $roomId)
                    ->where('id', $targetCharacterId)
                    ->where('userId', '!=', $userId)
                    ->where('isDead', false)
                    ->first();

                if (!$target) {
                    throw new Exception('攻撃対象のキャラクターが見つかりません');
                }

                $evasionChance = $target->evasion;
                $hitRoll = rand(0, 100);
                $isHit = $hitRoll > $evasionChance;

                if ($isHit) {
                    $damage = max(0, $attacker->power);
                    $message = "";

                    if ($target->blockCount > 0) {
                        $target->update(['blockCount' => $target->blockCount - 1]);
                        $damage = 0;
                        $newLife = $target->life;

                        RoomLog::create([
                            'roomId' => $roomId,
                            'actionType' => 'shield',
                            'actorUserId' => $attacker->userId,
                            'actorCharacterId' => $attacker->characterId,
                            'targetUserId' => $target->userId,
                            'targetCharacterId' => $target->characterId,
                            'value' => 0,
                            'description' => "{$target->character->name} のシールドが攻撃を防いだ（残りシールド: {$target->blockCount}）",
                        ]);

                        $message = "{$attacker->character->name} の攻撃が {$target->character->name} のシールドに防がれました";
                    } else {
                        $context = [
                            'attacker' => $attacker,
                            'target' => $target,
                            'damage' => &$damage,
                            'actorUserId' => $attacker->userId,
                            'actorCharacterId' => $attacker->characterId,
                            'targetUserId' => $target->userId,
                            'targetCharacterId' => $target->characterId,
                        ];
                        $passiveLogs = PassiveSkillManager::applyPassives($room, 'before_damage_taken', $context);

                        $newLife = max(0, $target->life - $damage);
                        $target->update(['life' => $newLife, 'isDead' => $newLife <= 0]);

                        $context['damage'] = $damage;
                        $passiveLogs = array_merge(
                            $passiveLogs,
                            PassiveSkillManager::applyPassives($room, 'on_damage_taken', $context),
                            PassiveSkillManager::applyPassives($room, 'on_attack_hit', $context),
                            PassiveSkillManager::applyPassives($room, 'on_life_changed', array_merge($context, ['target' => $target]))
                        );

                        foreach ($passiveLogs as $log) {
                            RoomLog::create([
                                'roomId' => $roomId,
                                'actionType' => 'passive',
                                'actorUserId' => $log['userId'],
                                'actorCharacterId' => $log['characterId'],
                                'description' => $log['description'],
                            ]);
                        }

                        RoomLog::create([
                            'roomId' => $roomId,
                            'actionType' => 'attack',
                            'actorUserId' => $attacker->userId,
                            'actorCharacterId' => $attacker->characterId,
                            'targetUserId' => $target->userId,
                            'targetCharacterId' => $target->characterId,
                            'value' => $damage,
                            'description' => "{$attacker->character->name} が {$target->character->name} に {$damage} ダメージを与えました",
                        ]);

                        if ($newLife <= 0) {
                            RoomLog::create([
                                'roomId' => $roomId,
                                'actionType' => 'death',
                                'targetUserId' => $target->userId,
                                'targetCharacterId' => $target->characterId,
                                'description' => "{$target->character->name} がダウンしました",
                            ]);
                        }

                        $message = "{$attacker->character->name} が {$target->character->name} に {$damage} ダメージを与えました";
                    }
                } else {
                    $damage = 0;
                    $newLife = $target->life;
                    RoomLog::create([
                        'roomId' => $roomId,
                        'actionType' => 'attack',
                        'actorUserId' => $attacker->userId,
                        'actorCharacterId' => $attacker->characterId,
                        'targetUserId' => $target->userId,
                        'targetCharacterId' => $target->characterId,
                        'value' => 0,
                        'description' => "{$attacker->character->name} の攻撃が {$target->character->name} に回避されました",
                    ]);
                    $message = "{$attacker->character->name} の攻撃が {$target->character->name} に回避されました";
                }

                $attacker->update(['isActive' => false]);
                $room->update(['totalTurns' => DB::raw('totalTurns + 1')]);

                $context = [
                    'attacker' => $attacker,
                    'actorUserId' => $attacker->userId,
                    'actorCharacterId' => $attacker->characterId,
                ];
                $passiveLogs = PassiveSkillManager::applyPassives($room, 'on_action', $context);
                $passiveLogs = array_merge(
                    $passiveLogs,
                    PassiveSkillManager::applyPassives($room, 'turn_end', $context)
                );

                foreach ($passiveLogs as $log) {
                    RoomLog::create([
                        'roomId' => $roomId,
                        'actionType' => 'passive',
                        'actorUserId' => $log['userId'],
                        'actorCharacterId' => $log['characterId'],
                        'description' => $log['description'],
                    ]);
                }

                $nextTurn = $this->updateNextTurn($roomId);
                $this->checkBattleEnd($room);
                $room->refresh();

                return response()->json([
                    'message' => $message,
                    'room' => $room,
                    'attacker' => $attacker,
                    'targets' => [[
                        'id' => $target->id,
                        'userId' => $target->userId,
                        'life' => $newLife,
                        'isDead' => $newLife <= 0,
                        'blockCount' => $target->blockCount,
                    ]],
                    'next_turn_user_id' => $nextTurn ? $nextTurn->userId : null,
                    'next_turn_character_id' => $nextTurn ? $nextTurn->characterId : null,
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
     * スペシャルスキルを使用
     */
    public function skill(Request $request)
    {
        try {
            $roomId = $request->route('roomId');
            $userId = $request->route('userId');
            $targetCharacterId = $request->input('targetCharacterId');

            $room = Room::with(['hostUser', 'guestUser'])->where('id', $roomId)->first();

            if (!$room || $room->status !== 'battling') {
                return response()->json(['message' => 'バトルが進行中ではありません'], 400);
            }

            if ($room->currentTurnUserId !== $userId) {
                return response()->json(['message' => 'あなたのターンではありません'], 403);
            }

            return DB::transaction(function () use ($roomId, $userId, $targetCharacterId, $room) {
                $attacker = RoomCharacter::with('character')
                    ->where('roomId', $roomId)
                    ->where('userId', $userId)
                    ->where('characterId', $room->currentTurnCharacterId)
                    ->where('isActive', true)
                    ->where('isDead', false)
                    ->first();

                if (!$attacker) {
                    throw new Exception('行動可能なキャラクターが見つかりません');
                }

                if ($attacker->specialUsed) {
                    throw new Exception('このキャラクターのスペシャルスキルは既に使用済みです');
                }
                if ($room->totalTurns < $attacker->specialSkillTurn) {
                    throw new Exception("スペシャルスキルを発動するにはあと " . ($attacker->specialSkillTurn - $room->totalTurns) . " ターン必要です");
                }

                $skillType = $attacker->character->specialSkillName;
                if (!$skillType) {
                    throw new Exception('このキャラクターにスペシャルスキルが設定されていません');
                }

                $description = '';
                $targets = [];
                $isSingleTarget = in_array($skillType, ['単体攻撃力強化', '単体犠牲攻撃', '単体回復']);

                if ($isSingleTarget && !$targetCharacterId) {
                    throw new Exception('単体スキルの場合、ターゲットを指定してください');
                }

                $context = [
                    'attacker' => $attacker,
                    'target' => null,
                    'actorUserId' => $attacker->userId,
                    'actorCharacterId' => $attacker->characterId,
                ];
                $passiveLogs = PassiveSkillManager::applyPassives($room, 'before_skill_used', $context);

                switch ($skillType) {
                    case '単体攻撃力強化':
                        $target = RoomCharacter::with('character')
                            ->where('roomId', $roomId)
                            ->where('userId', $userId)
                            ->where('id', $targetCharacterId)
                            ->where('isDead', false)
                            ->first();
                        if (!$target) throw new Exception('対象が見つかりません');
                        $target->update(['power' => $target->power * 2]);
                        $description = "{$attacker->character->name} が {$target->character->name} の攻撃力を2倍に強化";
                        $targets = [$target];
                        break;

                    case '単体犠牲攻撃':
                        $target = RoomCharacter::with('character')
                            ->where('roomId', $roomId)
                            ->where('id', $targetCharacterId)
                            ->where('userId', '!=', $userId)
                            ->where('isDead', false)
                            ->first();
                        if (!$target) throw new Exception('対象が見つかりません');
                        $damage = $attacker->power * 5;
                        $context['target'] = $target;
                        $context['damage'] = &$damage;
                        $context['targetUserId'] = $target->userId;
                        $context['targetCharacterId'] = $target->characterId;
                        $passiveLogs = array_merge(
                            $passiveLogs,
                            PassiveSkillManager::applyPassives($room, 'before_damage_taken', $context)
                        );
                        $newLife = max(0, $target->life - $damage);
                        $target->update([
                            'life' => $newLife,
                            'isDead' => $newLife <= 0,
                        ]);
                        $attacker->update([
                            'life' => 0,
                            'isDead' => true,
                        ]);
                        $context['damage'] = $damage;
                        $passiveLogs = array_merge(
                            $passiveLogs,
                            PassiveSkillManager::applyPassives($room, 'on_damage_taken', $context),
                            PassiveSkillManager::applyPassives($room, 'on_skill_hit', $context),
                            PassiveSkillManager::applyPassives($room, 'on_life_changed', array_merge($context, ['target' => $target]))
                        );
                        $description = "{$attacker->character->name} が自爆し {$target->character->name} に {$damage} ダメージ";
                        $targets = [$target];
                        if ($newLife <= 0) {
                            RoomLog::create([
                                'roomId' => $roomId,
                                'actionType' => 'death',
                                'targetUserId' => $target->userId,
                                'targetCharacterId' => $target->characterId,
                                'description' => "{$target->character->name} がダウンしました",
                            ]);
                        }
                        RoomLog::create([
                            'roomId' => $roomId,
                            'actionType' => 'death',
                            'targetUserId' => $attacker->userId,
                            'targetCharacterId' => $attacker->characterId,
                            'description' => "{$attacker->character->name} がダウンしました",
                        ]);
                        break;

                    case '全体攻撃':
                        $targets = RoomCharacter::with('character')
                            ->where('roomId', $roomId)
                            ->where('userId', '!=', $userId)
                            ->where('isDead', false)
                            ->get();
                        $damage = $attacker->power * 2;
                        foreach ($targets as $target) {
                            $context['target'] = $target;
                            $context['damage'] = &$damage;
                            $context['targetUserId'] = $target->userId;
                            $context['targetCharacterId'] = $target->characterId;
                            $passiveLogs = array_merge(
                                $passiveLogs,
                                PassiveSkillManager::applyPassives($room, 'before_damage_taken', $context)
                            );
                            $newLife = max(0, $target->life - $damage);
                            $target->update([
                                'life' => $newLife,
                                'isDead' => $newLife <= 0,
                            ]);
                            $context['damage'] = $damage;
                            $passiveLogs = array_merge(
                                $passiveLogs,
                                PassiveSkillManager::applyPassives($room, 'on_damage_taken', $context),
                                PassiveSkillManager::applyPassives($room, 'on_skill_hit', $context),
                                PassiveSkillManager::applyPassives($room, 'on_life_changed', array_merge($context, ['target' => $target]))
                            );
                            if ($newLife <= 0) {
                                RoomLog::create([
                                    'roomId' => $roomId,
                                    'actionType' => 'death',
                                    'targetUserId' => $target->userId,
                                    'targetCharacterId' => $target->characterId,
                                    'description' => "{$target->character->name} がダウンしました",
                                ]);
                            }
                        }
                        $description = "{$attacker->character->name} が全体攻撃で {$damage} ダメージ";
                        break;

                    default:
                        throw new Exception('未実装のスペシャルスキルです');
                }

                foreach ($passiveLogs as $log) {
                    RoomLog::create([
                        'roomId' => $roomId,
                        'actionType' => 'passive',
                        'actorUserId' => $log['userId'],
                        'actorCharacterId' => $log['characterId'],
                        'description' => $log['description'],
                    ]);
                }

                if ($skillType !== 'rm -rfff') {
                    $attacker->update(['specialUsed' => true]);
                    RoomLog::create([
                        'roomId' => $roomId,
                        'actionType' => 'special',
                        'actorUserId' => $attacker->userId,
                        'actorCharacterId' => $attacker->characterId,
                        'description' => $description,
                    ]);

                    $attacker->update(['isActive' => false]);
                    $room->update(['totalTurns' => DB::raw('totalTurns + 1')]);

                    $context = [
                        'attacker' => $attacker,
                        'actorUserId' => $attacker->userId,
                        'actorCharacterId' => $attacker->characterId,
                    ];
                    $passiveLogs = PassiveSkillManager::applyPassives($room, 'on_action', $context);
                    $passiveLogs = array_merge(
                        $passiveLogs,
                        PassiveSkillManager::applyPassives($room, 'turn_end', $context)
                    );

                    foreach ($passiveLogs as $log) {
                        RoomLog::create([
                            'roomId' => $roomId,
                            'actionType' => 'passive',
                            'actorUserId' => $log['userId'],
                            'actorCharacterId' => $log['characterId'],
                            'description' => $log['description'],
                        ]);
                    }

                    $nextTurn = $this->updateNextTurn($roomId);
                } else {
                    $nextTurn = null;
                }

                $this->checkBattleEnd($room);

                $room->refresh();

                return response()->json([
                    'message' => $description,
                    'room' => $room,
                    'attacker' => $attacker,
                    'targets' => $targets->map(fn($t) => [
                        'id' => $t->id,
                        'userId' => $t->userId,
                        'life' => $t->life,
                        'isDead' => $t->isDead,
                        'power' => $t->power,
                        'speed' => $t->speed,
                        'evasion' => $t->evasion,
                    ]),
                    'next_turn_user_id' => $nextTurn ? $nextTurn->userId : null,
                    'next_turn_character_id' => $nextTurn ? $nextTurn->characterId : null,
                    'skill_type' => $skillType,
                    'is_single_target' => $isSingleTarget,
                ], 200);
            });
        } catch (Exception $e) {
            return response()->json([
                'message' => 'スペシャルスキル処理に失敗しました',
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

            $room = Room::with(['hostUser', 'guestUser'])->where('id', $roomId)->first();

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
                $guestUserId = $room->guestUserId;

                RoomCharacter::where('roomId', $room->id)
                    ->where('userId', $guestUserId)
                    ->delete();

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
     * 次のターンを更新
     */
    private function updateNextTurn($roomId)
    {
        $nextTurn = RoomCharacter::where('roomId', $roomId)
            ->where('isActive', true)
            ->where('isDead', false)
            ->orderBy('speed', 'desc')
            ->first();

        if (!$nextTurn) {
            RoomCharacter::where('roomId', $roomId)
                ->where('isDead', false)
                ->update(['isActive' => true]);

            $nextTurn = RoomCharacter::where('roomId', $roomId)
                ->where('isActive', true)
                ->where('isDead', false)
                ->orderBy('speed', 'desc')
                ->first();

            if ($nextTurn) {
                RoomLog::create([
                    'roomId' => $roomId,
                    'actionType' => 'turnReset',
                    'description' => 'ターンがリセットされました',
                ]);
            }
        }

        if ($nextTurn) {
            Room::where('id', $roomId)->update([
                'currentTurnUserId' => $nextTurn->userId,
                'currentTurnCharacterId' => $nextTurn->characterId
            ]);
        }

        return $nextTurn;
    }

    /**
     * バトル終了をチェック
     */
    private function checkBattleEnd($room)
    {
        $hostAlive = RoomCharacter::where('roomId', $room->id)
            ->where('userId', $room->hostUserId)
            ->where('isDead', false)
            ->exists();
        $guestAlive = RoomCharacter::where('roomId', $room->id)
            ->where('userId', $room->guestUserId)
            ->where('isDead', false)
            ->exists();

        if (!$hostAlive || !$guestAlive) {
            $winUserId = !$hostAlive ? $room->guestUserId : $room->hostUserId;
            $room->update([
                'status' => 'finish',
                'winUserId' => $winUserId
            ]);
            RoomLog::create([
                'roomId' => $room->id,
                'actionType' => 'finish',
                'description' => !$hostAlive ? "{$room->hostUser->name} 側が全滅し、バトルが終了しました" : "{$room->guestUser->name} 側が全滅し、バトルが終了しました",
            ]);
        }
    }

    /**
     * 特定のルームを削除
     */
    public function delete(Request $request)
    {
        try {
            $roomId = $request->route('roomId');
            $userId = $request->route('userId');

            $room = Room::where('id', $roomId)->first();

            if (!$room) {
                return response()->json(['message' => 'ルームが見つかりません'], 404);
            }

            if ($room->hostUserId !== $userId) {
                return response()->json(['message' => 'ルームを削除する権限がありません'], 403);
            }

            DB::transaction(function () use ($room) {
                RoomCharacter::where('roomId', $room->id)->delete();
                $room->delete();
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
                'message' => 'すべてのルームが正常に削除されました',
                'deleted_count' => $deletedCount
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'ルームの削除に失敗しました',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

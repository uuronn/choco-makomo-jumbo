<?php

namespace App\Http\Controller;

use App\Model\Character;
use App\Model\Room;
use App\Model\RoomCharacter;
use App\Model\RoomLog;
use App\Model\User;
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

    private function applyPartyBonuses($characterNames, $hostUser, $room)
    {
        $powerMultiplier = 1.0;
        $speedMultiplier = 1.0;
        $lifeMultiplier = 1.0;
        $evasionMultiplier = 1.0;
        $logs = [];

        // 1. 三大フレームワーク
        if (!array_diff(['Vue', 'React', 'Angular'], $characterNames)) {
            $powerMultiplier *= 1.10;
            $speedMultiplier *= 1.10;
            $lifeMultiplier *= 1.10;
            $evasionMultiplier *= 1.10;
            $logs[] = "{$hostUser->name} が「三大フレームワーク」を発動、全ステータスが10%アップ";
        }

        // 2. 三大クラウド
        if (!array_diff(['AWS', 'GCP', 'Azure'], $characterNames)) {
            $powerMultiplier *= 1.15;
            $speedMultiplier *= 1.15;
            $lifeMultiplier *= 1.15;
            $logs[] = "{$hostUser->name} が「三大クラウド」を発動、最大HP、パワー、スピードが15%アップ";
        }

        // 3. 型安全
        if (in_array('Typescript', $characterNames) &&
            (in_array('Vue', $characterNames) || in_array('React', $characterNames) ||
            in_array('Angular', $characterNames) || in_array('Javascript', $characterNames))) {
            $powerMultiplier *= 1.05;
            $speedMultiplier *= 1.05;
            $evasionMultiplier *= 1.20;
            $logs[] = "{$hostUser->name} が「型安全」を発動、攻撃力5%アップ、スピード5%アップ、回避率20%アップ";
        }

        // 4. ハイパーバイザー型
        if (in_array('Docker', $characterNames) && count($characterNames) >= 2) {
            $powerMultiplier *= 1.07;
            $speedMultiplier *= 1.07;
            $evasionMultiplier *= 1.07;
            $logs[] = "{$hostUser->name} が「ハイパーバイザー型」を発動、攻撃力7%アップ、スピード7%アップ、回避率7%アップ";
        }

        // 5. WSL2
        $osCharacters = ['Linux', 'Mac'];
        if (in_array('windows', $characterNames) &&
            count(array_intersect($characterNames, $osCharacters)) == 0 &&
            count($characterNames) >= 2) {
            $powerMultiplier *= 1.15;
            $lifeMultiplier *= 1.15;
            $speedMultiplier *= 0.80;
            $logs[] = "{$hostUser->name} が「WSL2」を発動、最大HP15%アップ、パワー15%アップ、スピード20%ダウン";
        }

        // 6. DBマスター
        $dbCharacters = ['Mysql', 'Postgres', 'Supabase'];
        if (count(array_intersect($characterNames, $dbCharacters)) > 0) {
            $lifeMultiplier *= 1.30;
            $logs[] = "{$hostUser->name} が「DBマスター」を発動、最大HPが30%アップ";
        }

        return [
            'powerMultiplier' => $powerMultiplier,
            'speedMultiplier' => $speedMultiplier,
            'lifeMultiplier' => $lifeMultiplier,
            'evasionMultiplier' => $evasionMultiplier,
            'logs' => $logs,
        ];
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

            $room = DB::transaction(function () use ($request, $characterIdList, $hostUser) {
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
                        throw new Exception("キャラクター {$characterId} が見つかりません", 404);
                    }
                    $userCharacter = UserCharacter::where('userId', $request->hostUserId)
                        ->where('characterId', $characterId)
                        ->first();
                    if (!$userCharacter) {
                        throw new Exception("ユーザーのキャラクター {$characterId} が見つかりません", 404);
                    }
                    $characterNames[] = $character->name;
                }

                // スキル適用
                $bonuses = $this->applyPartyBonuses($characterNames, $hostUser, $room);
                $powerMultiplier = $bonuses['powerMultiplier'];
                $speedMultiplier = $bonuses['speedMultiplier'];
                $lifeMultiplier = $bonuses['lifeMultiplier'];
                $evasionMultiplier = $bonuses['evasionMultiplier'];

                // ログ記録
                if (!empty($bonuses['logs'])) {
                    RoomLog::create([
                        'roomId' => $room->id,
                        'actionType' => 'partyBonus',
                        'actorUserId' => $request->hostUserId,
                        'actorCharacterId' => null,
                        'targetUserId' => null,
                        'targetCharacterId' => null,
                        'value' => null,
                        'description' => implode(' / ', $bonuses['logs']),
                    ]);
                }

                // キャラクターに倍率を適用
                foreach ($characterIdList as $characterId) {
                    $character = Character::find($characterId);
                    $userCharacter = UserCharacter::where('userId', $request->hostUserId)
                        ->where('characterId', $characterId)
                        ->first();

                    RoomCharacter::create([
                        'roomId' => $room->id,
                        'characterId' => $characterId,
                        'userId' => $room->hostUserId,
                        'level' => $userCharacter->level,
                        'life' => $userCharacter->life * $lifeMultiplier,
                        'maxLife' => $userCharacter->life * $lifeMultiplier,
                        'power' => $userCharacter->power * $powerMultiplier,
                        'speed' => $userCharacter->speed * $speedMultiplier,
                        'evasion' => $character->base_evasion * $evasionMultiplier,
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

            $room->update([
                'guestUserId' => $request->guestUserId,
                'status' => 'pending',
            ]);

            $characterNames = [];
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
                $characterNames[] = $character->name;
            }

            // スキル適用
            $bonuses = $this->applyPartyBonuses($characterNames, $guestUser, $room);
            $powerMultiplier = $bonuses['powerMultiplier'];
            $speedMultiplier = $bonuses['speedMultiplier'];
            $lifeMultiplier = $bonuses['lifeMultiplier'];
            $evasionMultiplier = $bonuses['evasionMultiplier'];

            // ログ記録
            if (!empty($bonuses['logs'])) {
                RoomLog::create([
                    'roomId' => $room->id,
                    'actionType' => 'partyBonus',
                    'actorUserId' => $request->guestUserId,
                    'actorCharacterId' => null,
                    'targetUserId' => null,
                    'targetCharacterId' => null,
                    'value' => null,
                    'description' => implode(' / ', $bonuses['logs']),
                ]);
            }

            // キャラクターに倍率を適用
            foreach ($characterIdList as $characterId) {
                $character = Character::find($characterId);
                $userCharacter = UserCharacter::where('userId', $request->guestUserId)
                    ->where('characterId', $characterId)
                    ->first();

                RoomCharacter::create([
                    'roomId' => $room->id,
                    'characterId' => $characterId,
                    'userId' => $request->guestUserId,
                    'level' => $userCharacter->level,
                    'life' => $userCharacter->life * $lifeMultiplier,
                    'maxLife' => $userCharacter->life * $lifeMultiplier,
                    'power' => $userCharacter->power * $powerMultiplier,
                    'speed' => $userCharacter->speed * $speedMultiplier,
                    'evasion' => $character->base_evasion * $evasionMultiplier,
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
                        'description' => "{$room->hostUser->name} のパーティ ['Warrior', 'Mage', 'Healer'] で攻撃力が20%増、スピードが10%増",
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
                        'description' => "{$room->hostUser->name} のパーティ ['Knight', 'Wizard', 'Priest'] で攻撃力が10%増、回避率が30%増",
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
                        'description' => "{$room->guestUser->name} のパーティ ['Archer', 'Tank', 'Support'] でスピードが25%増、攻撃力が15%増",
                    ]);
                } elseif (!array_diff(['Rogue', 'Berserker', 'Cleric'], $guestCharacterNames)) {
                    RoomCharacter::where('roomId', $roomId)
                        ->where('userId', $room->guestUserId)
                        ->update([
                            'evasion' => DB::raw('evasion * 1.2'),
                            'maxLife' => DB::raw('maxLife * 1.2')
                        ]);
                    RoomLog::create([
                        'roomId' => $roomId,
                        'actionType' => 'partyBonus',
                        'actorUserId' => $room->guestUserId,
                        'actorCharacterId' => null,
                        'targetUserId' => null,
                        'targetCharacterId' => null,
                        'value' => null,
                        'description' => "{$room->guestUser->name} のパーティ ['Rogue', 'Berserker', 'Cleric'] で回避率が20%増、最大HPが20%増",
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

                // RoomLog::create([
                //     'roomId' => $roomId,
                //     'actionType' => 'approve',
                //     'actorUserId' => $room->hostUserId,
                //     'actorCharacterId' => null,
                //     'targetUserId' => $room->guestUserId,
                //     'targetCharacterId' => null,
                //     'value' => null,
                //     'description' => "{$room->hostUser->name} が {$room->guestUser->name} の参加申請を承認しました",
                // ]);
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

            return response()->json($room, 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve room',
                'error' => $e->getMessage()
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

                $target = RoomCharacter::with('character')
                    ->where('roomId', $roomId)
                    ->where('id', $targetCharacterId)
                    ->where('userId', '!=', $userId)
                    ->where('isDead', false)
                    ->first();

                if (!$target) {
                    throw new Exception('攻撃対象のキャラクターが見つかりません');
                }

                $damage = max(0, $attacker->power);
                $newLife = max(0, $target->life - $damage);

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

                $target->update([
                    'life' => $newLife,
                    'isDead' => $newLife <= 0,
                ]);

                if ($newLife <= 0) {
                    RoomLog::create([
                        'roomId' => $roomId,
                        'actionType' => 'death',
                        'actorUserId' => null,
                        'actorCharacterId' => null,
                        'targetUserId' => $target->userId,
                        'targetCharacterId' => $target->characterId,
                        'value' => null,
                        'description' => "{$target->character->name} がダウンしました",
                    ]);
                }

                $attacker->update(['isActive' => false]);
                $room->update(['totalTurns' => DB::raw('totalTurns + 1')]);

                $nextTurn = $this->updateNextTurn($roomId);

                $this->checkBattleEnd($room);

                $room->refresh();

                return response()->json([
                    'message' => "{$attacker->character->name} が {$target->character->name} に {$damage} ダメージを与えました",
                    'room' => $room,
                    'attacker' => $attacker,
                    'targets' => [[
                        'id' => $target->id,
                        'userId' => $target->userId,
                        'life' => $newLife,
                        'isDead' => $newLife <= 0,
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
     * キャラクターがスペシャルスキルを使用する
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
                if ($room->totalTurns < $attacker->specialTurnRequirement) {
                    throw new Exception("スペシャルスキルを発動するにはあと " . ($attacker->specialTurnRequirement - $room->totalTurns) . " ターン必要です");
                }

                $skillType = $attacker->character->specialSkillType;
                if (!$skillType) {
                    throw new Exception('このキャラクターにスペシャルスキルが設定されていません');
                }

                $description = '';
                $targets = [];
                $isSingleTarget = in_array($skillType, ['boost_attack', 'sacrifice', 'single_heal']);

                if ($isSingleTarget && !$targetCharacterId) {
                    throw new Exception('単体スキルの場合、ターゲットを指定してください');
                }

                switch ($skillType) {
                    case 'boost_attack':
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

                    case 'sacrifice':
                        $target = RoomCharacter::with('character')
                            ->where('roomId', $roomId)
                            ->where('id', $targetCharacterId)
                            ->where('userId', '!=', $userId)
                            ->where('isDead', false)
                            ->first();
                        if (!$target) throw new Exception('対象が見つかりません');
                        $damage = $attacker->power * 5;
                        $newLife = max(0, $target->life - $damage);
                        $target->update([
                            'life' => $newLife,
                            'isDead' => $newLife <= 0,
                        ]);
                        $attacker->update([
                            'life' => 0,
                            'isDead' => true,
                        ]);
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
                            $newLife = max(0, $target->life - $damage);
                            $target->update([
                                'life' => $newLife,
                                'isDead' => $newLife <= 0,
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
                        }
                        $description = "{$attacker->character->name} が全体攻撃で {$damage} ダメージ";
                        break;

                    case '味方全体回復':
                        $targets = RoomCharacter::with('character')
                            ->where('roomId', $roomId)
                            ->where('userId', $userId)
                            ->where('isDead', false)
                            ->get();
                        foreach ($targets as $target) {
                            $newLife = $target->maxLife;
                            $target->update(['life' => $newLife]);
                        }
                        $description = "{$attacker->character->name} が味方全員を全回復";
                        break;

                    case 'stun_all':
                        $targets = RoomCharacter::with('character')
                            ->where('roomId', $roomId)
                            ->where('userId', '!=', $userId)
                            ->where('isDead', false)
                            ->get();
                        foreach ($targets as $target) {
                            $target->update(['isActive' => false]);
                        }
                        $description = "{$attacker->character->name} が敵全員を次ターン行動不能に";
                        break;

                    case 'single_heal':
                        $target = RoomCharacter::with('character')
                            ->where('roomId', $roomId)
                            ->where('userId', $userId)
                            ->where('id', $targetCharacterId)
                            ->where('isDead', false)
                            ->first();
                        if (!$target) throw new Exception('対象が見つかりません');
                        $newLife = min($target->maxLife, $target->life + 1000);
                        $target->update(['life' => $newLife]);
                        $description = "{$attacker->character->name} が {$target->character->name} を1000回復";
                        $targets = [$target];
                        break;

                    default:
                        throw new Exception('未実装のスペシャルスキルです');
                }

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

                $nextTurn = $this->updateNextTurn($roomId);

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

                // RoomLog::create([
                //     'roomId' => $room->id,
                //     'actionType' => 'reject',
                //     'actorUserId' => $room->hostUserId,
                //     'targetUserId' => $guestUserId,
                //     'description' => "{$room->hostUser->name} が {$room->guestUser->name} の参加申請を拒否しました",
                // ]);
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
     * 次のターンに進む
     */
    // public function nextTurn(Request $request)
    // {
    //     try {
    //         $roomId = $request->route('roomId');
    //         $userId = $request->route('userId'); // 現在の行動ユーザー

    //         $room = Room::where('id', $roomId)->first();

    //         if (!$room || $room->status !== 'battling') {
    //             return response()->json(['message' => 'バトルが進行中ではありません'], 400);
    //         }

    //         if ($room->currentTurnUserId !== $userId) {
    //             return response()->json(['message' => 'あなたのターンではありません'], 403);
    //         }

    //         return DB::transaction(function () use ($roomId, $userId, $room) {
    //             // 現在のユーザーの最速キャラクターを行動不能に
    //             RoomCharacter::where('roomId', $roomId)
    //                 ->where('userId', $userId)
    //                 ->where('isActive', true)
    //                 ->orderBy('speed', 'desc')
    //                 ->limit(1)
    //                 ->update(['isActive' => false]);

    //             $nextTurn = RoomCharacter::where('roomId', $roomId)
    //                 ->where('isActive', true)
    //                 ->orderBy('speed', 'desc')
    //                 ->first();

    //             if (!$nextTurn) {
    //                 RoomCharacter::where('roomId', $roomId)->update(['isActive' => true]);
    //                 $nextTurn = RoomCharacter::where('roomId', $roomId)
    //                     ->where('isActive', true)
    //                     ->orderBy('speed', 'desc')
    //                     ->first();
    //             }

    //             $room->update(['currentTurnUserId' => $nextTurn->userId, 'currentTurnCharacterId' => $nextTurn->characterId]);

    //             return response()->json([
    //                 'message' => '次のターンに進みました',
    //                 'room' => $room,
    //                 'next_turn_user_id' => $nextTurn->userId
    //             ], 200);
    //         });
    //     } catch (Exception $e) {
    //         return response()->json([
    //             'message' => 'ターン進行に失敗しました',
    //             'error' => $e->getMessage()
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

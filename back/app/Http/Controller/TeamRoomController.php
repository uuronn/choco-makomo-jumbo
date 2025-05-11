<?php

namespace App\Http\Controller;

use App\Model\Team;
use App\Model\TeamRoom;
use App\Model\TeamCharacter;
use App\Model\RoomCharacter;
use App\Model\RoomLog;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeamRoomController
{
    /**
     * チーム対戦ルーム作成
     */
    public function create(Request $request)
    {
        try {
            $teamId = $request->teamId;
            $userId = $request->userId;

            $team = Team::find($teamId);

            if (!$team) {
                return response()->json(['message' => 'チームが見つかりません'], 404);
            }

            if ($team->leaderUserId !== $userId) {
                return response()->json(['message' => 'ルーム作成権限がありません'], 403);
            }

            if ($team->status !== 'ready') {
                return response()->json(['message' => 'チームが準備完了状態ではありません'], 400);
            }

            $teamRoom = TeamRoom::create([
                'team1Id' => $teamId,
                'status' => 'waiting'
            ]);

            return response()->json($teamRoom, 201);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * チーム対戦ルームに参加
     */
    public function join(Request $request)
    {
        try {
            $roomId = $request->roomId;
            $teamId = $request->teamId;
            $userId = $request->userId;

            $team = Team::find($teamId);
            $room = TeamRoom::find($roomId);

            if (!$team || !$room) {
                return response()->json(['message' => 'チームまたはルームが見つかりません'], 404);
            }

            if ($team->leaderUserId !== $userId) {
                return response()->json(['message' => '参加権限がありません'], 403);
            }

            if ($team->status !== 'ready') {
                return response()->json(['message' => 'チームが準備完了状態ではありません'], 400);
            }

            if ($room->status !== 'waiting') {
                return response()->json(['message' => 'このルームには参加できません'], 400);
            }

            $room->update([
                'team2Id' => $teamId,
                'status' => 'pending'
            ]);

            return response()->json($room, 200);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * チーム対戦ルームの承認
     */
    public function approve(Request $request)
    {
        try {
            $roomId = $request->roomId;
            $userId = $request->userId;

            $room = TeamRoom::with(['team1', 'team2'])->find($roomId);

            if (!$room) {
                return response()->json(['message' => 'ルームが見つかりません'], 404);
            }

            if ($room->team1->leaderUserId !== $userId) {
                return response()->json(['message' => '承認権限がありません'], 403);
            }

            if ($room->status !== 'pending') {
                return response()->json(['message' => '現在承認できない状態です'], 400);
            }

            DB::transaction(function () use ($room) {
                // チーム1のキャラクターを登録
                $team1Characters = TeamCharacter::with('character')
                    ->where('teamId', $room->team1Id)
                    ->get();

                foreach ($team1Characters as $teamChar) {
                    RoomCharacter::create([
                        'roomId' => $room->id,
                        'characterId' => $teamChar->characterId,
                        'userId' => $teamChar->userId,
                        'level' => 1, // レベルは適切な値に設定
                        'life' => $teamChar->character->baseLife,
                        'maxLife' => $teamChar->character->baseLife,
                        'power' => $teamChar->character->basePower,
                        'speed' => $teamChar->character->baseSpeed,
                        'evasion' => $teamChar->character->baseEvasion,
                    ]);
                }

                // チーム2のキャラクターを登録
                $team2Characters = TeamCharacter::with('character')
                    ->where('teamId', $room->team2Id)
                    ->get();

                foreach ($team2Characters as $teamChar) {
                    RoomCharacter::create([
                        'roomId' => $room->id,
                        'characterId' => $teamChar->characterId,
                        'userId' => $teamChar->userId,
                        'level' => 1, // レベルは適切な値に設定
                        'life' => $teamChar->character->baseLife,
                        'maxLife' => $teamChar->character->baseLife,
                        'power' => $teamChar->character->basePower,
                        'speed' => $teamChar->character->baseSpeed,
                        'evasion' => $teamChar->character->baseEvasion,
                    ]);
                }

                // 最速キャラクターを特定して最初のターンを設定
                $firstCharacter = RoomCharacter::where('roomId', $room->id)
                    ->orderBy('speed', 'desc')
                    ->first();

                $room->update([
                    'status' => 'battling',
                    'currentTurnUserId' => $firstCharacter->userId,
                    'currentTurnCharacterId' => $firstCharacter->characterId
                ]);

                // 戦闘開始ログ
                RoomLog::create([
                    'roomId' => $room->id,
                    'actionType' => 'battle_start',
                    'description' => '戦闘が開始されました',
                ]);
            });

            return response()->json($room, 200);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * チーム対戦ルームのキャンセル
     */
    public function cancel(Request $request)
    {
        try {
            $roomId = $request->roomId;
            $userId = $request->userId;

            $room = TeamRoom::with(['team1', 'team2'])->find($roomId);

            if (!$room) {
                return response()->json(['message' => 'ルームが見つかりません'], 404);
            }

            if ($room->team2->leaderUserId !== $userId) {
                return response()->json(['message' => 'キャンセル権限がありません'], 403);
            }

            if ($room->status !== 'pending') {
                return response()->json(['message' => '現在キャンセルできない状態です'], 400);
            }

            $room->update([
                'team2Id' => null,
                'status' => 'waiting'
            ]);

            return response()->json($room, 200);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * チーム対戦ルームの状態取得
     */
    public function status(Request $request, $userId, $roomId)
    {
        try {
            $room = TeamRoom::with([
                'team1.leaderUser',
                'team1.memberUser',
                'team1.characters.character',
                'team2.leaderUser',
                'team2.memberUser',
                'team2.characters.character'
            ])->find($roomId);

            if (!$room) {
                return response()->json(['message' => 'ルームが見つかりません'], 404);
            }

            // ユーザーがいずれかのチームに所属しているか確認
            $isTeam1Member = $room->team1 && 
                ($room->team1->leaderUserId === $userId || $room->team1->memberUserId === $userId);
            $isTeam2Member = $room->team2 && 
                ($room->team2->leaderUserId === $userId || $room->team2->memberUserId === $userId);

            if (!$isTeam1Member && !$isTeam2Member) {
                return response()->json(['message' => 'このルームにアクセスする権限がありません'], 403);
            }

            // バトル中の場合、RoomCharacterも取得
            if ($room->status === 'battling') {
                $room->load(['roomCharacters' => function ($query) {
                    $query->with('character');
                }]);
            }

            return response()->json($room, 200);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * チーム対戦ルーム一覧の取得
     */
    public function list()
    {
        try {
            $rooms = TeamRoom::with([
                'team1.leaderUser',
                'team1.memberUser',
                'team2.leaderUser',
                'team2.memberUser'
            ])
            ->where('status', 'waiting')
            ->get();

            return response()->json($rooms, 200);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * 攻撃アクション
     */
    public function attack(Request $request)
    {
        try {
            $roomId = $request->roomId;
            $userId = $request->userId;
            $targetCharacterId = $request->targetCharacterId;

            $room = TeamRoom::find($roomId);

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

                $target = RoomCharacter::with('character')
                    ->where('roomId', $roomId)
                    ->where('id', $targetCharacterId)
                    ->where('isDead', false)
                    ->first();

                if (!$attacker || !$target) {
                    throw new Exception('攻撃者または対象が見つかりません');
                }

                // 回避判定
                $evasionChance = $target->evasion;
                $hitRoll = rand(0, 100);
                $isHit = $hitRoll > $evasionChance;

                if ($isHit) {
                    $damage = $attacker->power;
                    $newLife = max(0, $target->life - $damage);
                    $target->update([
                        'life' => $newLife,
                        'isDead' => $newLife <= 0
                    ]);

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
                } else {
                    RoomLog::create([
                        'roomId' => $roomId,
                        'actionType' => 'miss',
                        'actorUserId' => $attacker->userId,
                        'actorCharacterId' => $attacker->characterId,
                        'targetUserId' => $target->userId,
                        'targetCharacterId' => $target->characterId,
                        'description' => "{$attacker->character->name} の攻撃が {$target->character->name} にミス",
                    ]);
                }

                $attacker->update(['isActive' => false]);
                $room->update(['totalTurns' => DB::raw('totalTurns + 1')]);

                // 次のターンを決定
                $nextCharacter = RoomCharacter::where('roomId', $roomId)
                    ->where('isActive', true)
                    ->where('isDead', false)
                    ->orderBy('speed', 'desc')
                    ->first();

                if (!$nextCharacter) {
                    // 全キャラクターが行動済みの場合、リセット
                    RoomCharacter::where('roomId', $roomId)
                        ->where('isDead', false)
                        ->update(['isActive' => true]);

                    $nextCharacter = RoomCharacter::where('roomId', $roomId)
                        ->where('isDead', false)
                        ->orderBy('speed', 'desc')
                        ->first();
                }

                if ($nextCharacter) {
                    $room->update([
                        'currentTurnUserId' => $nextCharacter->userId,
                        'currentTurnCharacterId' => $nextCharacter->characterId
                    ]);
                }

                // 勝敗判定
                $this->checkBattleEnd($room);

                $room->refresh();
                return response()->json([
                    'room' => $room,
                    'attacker' => $attacker,
                    'target' => $target,
                    'damage' => $isHit ? $damage : 0,
                    'isHit' => $isHit
                ], 200);
            });
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * 勝敗判定
     */
    private function checkBattleEnd($room)
    {
        $team1Alive = RoomCharacter::where('roomId', $room->id)
            ->whereIn('userId', [$room->team1->leaderUserId, $room->team1->memberUserId])
            ->where('isDead', false)
            ->exists();

        $team2Alive = RoomCharacter::where('roomId', $room->id)
            ->whereIn('userId', [$room->team2->leaderUserId, $room->team2->memberUserId])
            ->where('isDead', false)
            ->exists();

        if (!$team1Alive || !$team2Alive) {
            $winTeamId = !$team1Alive ? $room->team2Id : $room->team1Id;
            
            $room->update([
                'status' => 'finish',
                'winTeamId' => $winTeamId,
                'currentTurnUserId' => null,
                'currentTurnCharacterId' => null
            ]);

            RoomLog::create([
                'roomId' => $room->id,
                'actionType' => 'finish',
                'description' => !$team1Alive ? 'チーム2の勝利です！' : 'チーム1の勝利です！'
            ]);
        }
    }
} 
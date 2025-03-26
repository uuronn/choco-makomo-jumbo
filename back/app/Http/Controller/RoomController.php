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
            $powerMultiplier *= 1.25;
            $speedMultiplier *= 1.25;
            $lifeMultiplier *= 1.25;
            $evasionMultiplier *= 1.25;
            $logs[] = "{$hostUser->name} が「三大フレームワーク」を発動、全ステータスが25%アップ";
        }

        // 2. 三大クラウド
        if (!array_diff(['AWS', 'Google Cloud', 'Azure'], $characterNames)) {
            $lifeMultiplier *= 1.60;
            $logs[] = "{$hostUser->name} が「三大クラウド」を発動、最大HPが60%アップ";
        }

        // 3. 型安全
        // if (in_array('Typescript', $characterNames) &&
        //     (in_array('Vue', $characterNames) || in_array('React', $characterNames) ||
        //     in_array('Angular', $characterNames) || in_array('Javascript', $characterNames))) {
        //     $powerMultiplier *= 1.05;
        //     $speedMultiplier *= 1.05;
        //     $evasionMultiplier *= 1.20;
        //     $logs[] = "{$hostUser->name} が「型安全」を発動、攻撃力5%アップ、スピード5%アップ、回避率20%アップ";
        // }

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
            $powerMultiplier *= 1.17;
            $lifeMultiplier *= 1.30;
            $speedMultiplier *= 0.80;
            $logs[] = "{$hostUser->name} が「WSL2」を発動、最大HP30%アップ、パワー17%アップ、スピード20%ダウン";
        }

        // 6. DBマスター
        // $dbCharacters = ['Mysql', 'Postgres', 'Supabase'];
        // if (count(array_intersect($characterNames, $dbCharacters)) > 0) {
        //     $lifeMultiplier *= 1.30;
        //     $logs[] = "{$hostUser->name} が「DBマスター」を発動、最大HPが30%アップ";
        // }

        // 7. HTML5トリオ（html, CSS, Javascript）
        if (!array_diff(['html', 'CSS', 'Javascript'], $characterNames)) {
            $powerMultiplier *= 1.10;
            $lifeMultiplier *= 1.25;
            $evasionMultiplier *= 1.10;
            $logs[] = "{$hostUser->name} が「HTML5トリオ」を発動、攻撃力10%アップ、最大HP25%アップ、回避率10%アップ";
        }

        // 8. OSトリオ（windows, Mac, Linux）
        if (!array_diff(['windows', 'Mac', 'Linux'], $characterNames)) {
            $powerMultiplier *= 1.15;
            $speedMultiplier *= 1.15;
            $lifeMultiplier *= 1.15;
            $evasionMultiplier *= 1.15;
            $logs[] = "{$hostUser->name} が「OSトリオ」を発動、攻撃力15%アップ、スピード15%アップ、最大HP15%アップ、回避率15%アップ";
        }

        // 9. サーバーサイド言語（PHP, Go, Ruby）
        $serverSideLangs = ['PHP', 'Go', 'Ruby'];
        if (count(array_intersect($characterNames, $serverSideLangs)) >= 2) {
            $powerMultiplier *= 1.40;
            $speedMultiplier *= 1.40;
            $logs[] = "{$hostUser->name} が「サーバーサイド言語」を発動、攻撃力40%アップ、スピード40%アップ";
        }

        // 10. 高速開発（Swift, Javascript, Ruby）
        // $fastDevLangs = ['Swift', 'Javascript', 'Ruby'];
        // if (count(array_intersect($characterNames, $fastDevLangs)) >= 2) {
        //     $speedMultiplier *= 1.15;
        //     $evasionMultiplier *= 1.10;
        //     $logs[] = "{$hostUser->name} が「高速開発」を発動、スピード15%アップ、回避率10%アップ";
        // }

        // 11. ゲーム開発（Unity, Javascript）
        // if (in_array('Unity', $characterNames) && in_array('Javascript', $characterNames)) {
        //     $powerMultiplier *= 1.12;
        //     $speedMultiplier *= 1.08;
        //     $logs[] = "{$hostUser->name} が「ゲーム開発」を発動、攻撃力12%アップ、スピード8%アップ";
        // }

        // 12. フロントエンドマスター（html, CSS, Vue）
        if (!array_diff(['html', 'CSS', 'Vue'], $characterNames)) {
            $speedMultiplier *= 1.12;
            $evasionMultiplier *= 1.15;
            $logs[] = "{$hostUser->name} が「フロントエンドマスター」を発動、スピード12%アップ、回避率15%アップ";
        }

        // 13. データベース連携（Mysql, PHP）
        if (in_array('Mysql', $characterNames) && in_array('PHP', $characterNames)) {
            $powerMultiplier *= 1.10;
            $lifeMultiplier *= 1.08;
            $logs[] = "{$hostUser->name} が「データベース連携」を発動、攻撃力10%アップ、最大HP8%アップ";
        }

        // 14. コンテナ最適化（Docker, Go）
        if (in_array('Docker', $characterNames) && in_array('Go', $characterNames)) {
            $speedMultiplier *= 1.10;
            $evasionMultiplier *= 1.08;
            $logs[] = "{$hostUser->name} が「コンテナ最適化」を発動、スピード10%アップ、回避率8%アップ";
        }

        // 15. モダンスタック（React, Typescript）
        if (in_array('React', $characterNames) && in_array('Typescript', $characterNames)) {
            $lifeMultiplier *= 1.15;
            $powerMultiplier *= 1.15;
            $speedMultiplier *= 1.15;
            $logs[] = "{$hostUser->name} が「モダンスタック」を発動、最大HP15%アップ、攻撃力15%アップ、スピード15%アップ";
        }

        // 16. インフラマスター（AWS, Docker, Linux）
        // if (!array_diff(['AWS', 'Docker', 'Linux'], $characterNames)) {
        //     $powerMultiplier *= 1.12;
        //     $lifeMultiplier *= 1.10;
        //     $speedMultiplier *= 1.08;
        //     $logs[] = "{$hostUser->name} が「インフラマスター」を発動、攻撃力12%アップ、最大HP10%アップ、スピード8%アップ";
        // }

        // 17. モバイル開発（Swift, React）
        // if (in_array('Swift', $characterNames) && in_array('React', $characterNames)) {
        //     $speedMultiplier *= 1.12;
        //     $evasionMultiplier *= 1.10;
        //     $logs[] = "{$hostUser->name} が「モバイル開発」を発動、スピード12%アップ、回避率10%アップ";
        // }

        // 18. データベーストリオ（Mysql, Postgres, Supabase）
        if (!array_diff(['Mysql', 'Postgres', 'Supabase'], $characterNames)) {
            $lifeMultiplier *= 1.20;
            $powerMultiplier *= 1.20;
            $speedMultiplier *= 1.20;
            $evasionMultiplier *= 1.20;
            $logs[] = "{$hostUser->name} が「DBマスター」を発動、最大HP20%アップ、攻撃力20%アップ、スピード20%アップ、回避率20%アップ";
        }

        // 19. クラウドネイティブ（AWS, Docker, Supabase）
        // if (!array_diff(['AWS', 'Docker', 'Supabase'], $characterNames)) {
        //     $speedMultiplier *= 1.10;
        //     $lifeMultiplier *= 1.12;
        //     $evasionMultiplier *= 1.08;
        //     $logs[] = "{$hostUser->name} が「クラウドネイティブ」を発動、スピード10%アップ、最大HP12%アップ、回避率8%アップ";
        // }

        // 20. レガシーアップデート（PHP, html, CSS）
        if (!array_diff(['PHP', 'html', 'CSS'], $characterNames)) {
            $powerMultiplier *= 1.15;
            $lifeMultiplier *= 1.15;
            $logs[] = "{$hostUser->name} が「レガシーアップデート」を発動、攻撃力15%アップ、最大HP15%アップ";
        }

        // 21. フルスタック（Javascript, Ruby, Docker）
        // if (!array_diff(['Javascript', 'Ruby', 'Docker'], $characterNames)) {
        //     $powerMultiplier *= 1.10;
        //     $speedMultiplier *= 1.08;
        //     $lifeMultiplier *= 1.10;
        //     $logs[] = "{$hostUser->name} が「フルスタック」を発動、攻撃力10%アップ、スピード8%アップ、最大HP10%アップ";
        // }

        // 22. Ruby & Rails パーティ
        if (count($characterNames) === 2 &&
        in_array('Ruby', $characterNames) &&
        in_array('Ruby on Rails', $characterNames)) {
            $powerMultiplier *= 1.35;
            $speedMultiplier *= 1.35;
            $lifeMultiplier *= 1.35;
            $logs[] = "{$hostUser->name} が「Railsマジック」を発動、攻撃力35%アップ、スピード35%アップ、最大HP35%アップ";
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
                        'evasion' => $character->baseEvasion * $evasionMultiplier,
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
                    'evasion' => $character->baseEvasion * $evasionMultiplier,
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

                // 回避率の計算（0〜100の範囲でランダム値を生成し、evasion以下なら回避）
                $evasionChance = $target->evasion; // 例: 7なら7%
                $hitRoll = rand(0, 100); // 0〜100の乱数
                $isHit = $hitRoll > $evasionChance; // 回避率より大きければ命中

                if ($isHit) {
                    // 命中した場合
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

                    $message = "{$attacker->character->name} が {$target->character->name} に {$damage} ダメージを与えました";
                } else {
                    // 回避した場合
                    $damage = 0;
                    $newLife = $target->life; // ライフは変わらない

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
                $isSingleTarget = in_array($skillType, ['単体攻撃力強化', '単体犠牲攻撃', '単体回復']);

                if ($isSingleTarget && !$targetCharacterId) {
                    throw new Exception('単体スキルの場合、ターゲットを指定してください');
                }

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

                    case '全体回復':
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

                    case '全体スタン':
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

                    case 'LiveScript':
                        $targets = RoomCharacter::with('character')
                            ->where('roomId', $roomId)
                            ->where('userId', '!=', $userId)
                            ->where('isDead', false)
                            ->get();
                        foreach ($targets as $target) {
                            $target->update(['isActive' => false]);
                        }
                        $description = "{$attacker->character->name}が「LiveScript」を発動、敵全員の次ターンを飛ばした";
                        break;

                    case 'SQLインジェクション':
                        $targets = RoomCharacter::with('character')
                            ->where('roomId', $roomId)
                            ->where('userId', '!=', $userId)
                            ->where('isDead', false)
                            ->get();
                        foreach ($targets as $target) {
                            $oldPower = $target->power;
                            $oldSpeed = $target->speed;
                            $target->update([
                                'power' => $oldSpeed,
                                'speed' => $oldPower,
                            ]);
                        }
                        $description = "{$attacker->character->name} が敵全員の攻撃力とスピードを入れ替えた";
                        break;

                    case 'rm -rf /':
                        $targets = RoomCharacter::with('character')
                        ->where('roomId', $roomId)
                        ->where('userId', '!=', $userId)
                        ->where('isDead', false)
                        ->get();
                        $damage = $attacker->power * 2;
                        foreach ($targets as $target) {
                            // $newLife = max(0, $target->life - $damage);
                            $newLife = 0;
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
                        $description = "{$attacker->character->name} が「rm -rf」を発動、ゲームに勝利";
                        break;

                    case 'ゴルーチンラッシュ': // Go用（全体攻撃の変形）
                        $targets = RoomCharacter::with('character')
                            ->where('roomId', $roomId)
                            ->where('userId', '!=', $userId)
                            ->where('isDead', false)
                            ->get();
                        $damage = $attacker->power * 2.0; // 全体攻撃（2倍）より少し強め
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
                        $description = "{$attacker->character->name} が「ゴルーチンラッシュ」を発動、敵全員に {$damage} ダメージ";
                        break;

                    // case 'Eloquentストライク': // ruby on rails用（全体攻撃の変形）
                    //     $targets = RoomCharacter::with('character')
                    //         ->where('roomId', $roomId)
                    //         ->where('userId', '!=', $userId)
                    //         ->where('isDead', false)
                    //         ->get();
                    //     $damage = $attacker->power * 2.0; // 全体攻撃（2倍）より少し強め
                    //     foreach ($targets as $target) {
                    //         $newLife = max(0, $target->life - $damage);
                    //         $target->update([
                    //             'life' => $newLife,
                    //             'isDead' => $newLife <= 0,
                    //         ]);
                    //         if ($newLife <= 0) {
                    //             RoomLog::create([
                    //                 'roomId' => $roomId,
                    //                 'actionType' => 'death',
                    //                 'targetUserId' => $target->userId,
                    //                 'targetCharacterId' => $target->characterId,
                    //                 'description' => "{$target->character->name} がダウンしました",
                    //             ]);
                    //         }
                    //     }
                    //     $description = "{$attacker->character->name} が「Eloquentストライク」を発動、敵全員に {$damage} ダメージ";
                    //     break;


                    case 'セマンティックHTML': // html用（回避アップ）
                        $targets = RoomCharacter::with('character')
                            ->where('roomId', $roomId)
                            ->where('userId', $userId)
                            ->where('isDead', false)
                            ->get();
                        foreach ($targets as $target) {
                            $target->update(['evasion' => $target->evasion + 30]); // 10より少し強め
                        }
                        $description = "{$attacker->character->name} が「セマンティックHTML」を発動、味方全員の回避率が30アップ";
                        break;

                    case '依存性の注入': // Angular用（全体回復の変形）
                        $targets = RoomCharacter::with('character')
                            ->where('roomId', $roomId)
                            ->where('userId', $userId)
                            ->where('isDead', false)
                            ->get();
                        foreach ($targets as $target) {
                            $healAmount = (int)($target->maxLife * 0.25); // 30%より少し弱め
                            $newLife = min($target->maxLife, $target->life + $healAmount);
                            $target->update(['life' => $newLife]);
                        }
                        $description = "{$attacker->character->name} が「依存性の注入」を発動、味方全員の体力を25%回復";
                        break;
                    case 'IEを削除': // windows用（全体回復の変形）
                        $targets = RoomCharacter::with('character')
                            ->where('roomId', $roomId)
                            ->where('userId', $userId)
                            ->where('isDead', false)
                            ->get();
                        foreach ($targets as $target) {
                            $healAmount = (int)($target->maxLife * 0.4); // 全回復より弱め
                            $newLife = min($target->maxLife, $target->life + $healAmount);
                            $target->update(['life' => $newLife]);
                        }
                        $description = "{$attacker->character->name} が「IEを削除」を発動、味方全員の体力を40%回復";
                        break;

                    case 'docker compose up': // windows用（全体回復の変形）
                        $targets = RoomCharacter::with('character')
                            ->where('roomId', $roomId)
                            ->where('userId', $userId)
                            ->where('isDead', false)
                            ->get();
                        foreach ($targets as $target) {
                            $healAmount = (int)($target->maxLife * 0.5); // 全回復より弱め
                            $newLife = min($target->maxLife, $target->life + $healAmount);
                            $target->update(['life' => $newLife]);
                        }
                        $description = "{$attacker->character->name} が「docker compose up」を発動、味方全員の体力を50%回復";
                        break;

                    case '物理エンジン操作': // Unity用（スピードデバフ）
                        $targets = RoomCharacter::with('character')
                            ->where('roomId', $roomId)
                            ->where('userId', '!=', $userId)
                            ->where('isDead', false)
                            ->get();
                        foreach ($targets as $target) {
                            $target->update(['speed' => (int)($target->speed * 0.10)]); // 30%より少し弱め
                        }
                        $description = "{$attacker->character->name} が「物理エンジン操作」を発動、敵全員のスピードが90%ダウン";
                        break;

                    default:
                        throw new Exception('未実装のスペシャルスキルです');
                }

                // if ($skillType !== 'rm -rfff') {
                //     $attacker->update(['specialUsed' => true]);
                //     RoomLog::create([
                //         'roomId' => $roomId,
                //         'actionType' => 'special',
                //         'actorUserId' => $attacker->userId,
                //         'actorCharacterId' => $attacker->characterId,
                //         'description' => $description,
                //     ]);

                //     $attacker->update(['isActive' => false]);
                //     $room->update(['totalTurns' => DB::raw('totalTurns + 1')]);

                //     $nextTurn = $this->updateNextTurn($roomId);
                // } else {
                    $nextTurn = null;
                // }

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

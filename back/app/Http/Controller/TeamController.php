<?php

namespace App\Http\Controller;

use App\Model\Team;
use App\Model\TeamCharacter;
use App\Model\Character;
use App\Model\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeamController
{
    /**
     * チーム作成
     */
    public function create(Request $request)
    {
        try {
            $leaderUserId = $request->userId;

            // 既存のチームをチェック
            $existingTeam = Team::where('leaderUserId', $leaderUserId)
                ->orWhere('memberUserId', $leaderUserId)
                ->first();

            if ($existingTeam) {
                return response()->json(['message' => '既に所属しているチームが存在します'], 409);
            }

            $team = DB::transaction(function () use ($leaderUserId) {
                $team = Team::create([
                    'leaderUserId' => $leaderUserId,
                    'status' => 'waiting'
                ]);

                return $team;
            });

            return response()->json($team, 201);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * チームに参加
     */
    public function join(Request $request)
    {
        try {
            $teamId = $request->teamId;
            $userId = $request->userId;

            $team = Team::find($teamId);

            if (!$team) {
                return response()->json(['message' => 'チームが見つかりません'], 404);
            }

            if ($team->status !== 'waiting') {
                return response()->json(['message' => 'このチームには参加できません'], 400);
            }

            if ($team->memberUserId) {
                return response()->json(['message' => 'このチームは満員です'], 400);
            }

            $team->update([
                'memberUserId' => $userId,
                'status' => 'pending'
            ]);

            return response()->json($team, 200);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * キャラクター選択
     */
    public function selectCharacter(Request $request)
    {
        try {
            $teamId = $request->teamId;
            $userId = $request->userId;
            $characterId = $request->characterId;

            $team = Team::with('characters')->find($teamId);

            if (!$team) {
                return response()->json(['message' => 'チームが見つかりません'], 404);
            }

            // チームメンバーかチェック
            if ($team->leaderUserId !== $userId && $team->memberUserId !== $userId) {
                return response()->json(['message' => 'このチームのメンバーではありません'], 403);
            }

            // キャラクター重複チェック
            if ($team->characters->contains('characterId', $characterId)) {
                return response()->json(['message' => 'このキャラクターは既に選択されています'], 400);
            }

            // ユーザーの選択済みキャラ数チェック
            $userCharCount = TeamCharacter::where('teamId', $teamId)
                ->where('userId', $userId)
                ->count();

            if ($userCharCount >= 3) {
                return response()->json(['message' => 'これ以上キャラクターを選択できません'], 400);
            }

            TeamCharacter::create([
                'teamId' => $teamId,
                'userId' => $userId,
                'characterId' => $characterId
            ]);

            return response()->json(['message' => 'キャラクターを選択しました'], 200);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * チームメンバーの承認
     */
    public function approve(Request $request)
    {
        try {
            $teamId = $request->teamId;
            $userId = $request->userId;

            $team = Team::find($teamId);

            if (!$team) {
                return response()->json(['message' => 'チームが見つかりません'], 404);
            }

            if ($team->leaderUserId !== $userId) {
                return response()->json(['message' => '承認権限がありません'], 403);
            }

            if ($team->status !== 'pending') {
                return response()->json(['message' => '現在承認できない状態です'], 400);
            }

            $team->update(['status' => 'ready']);

            return response()->json($team, 200);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * チーム参加のキャンセル
     */
    public function cancel(Request $request)
    {
        try {
            $teamId = $request->teamId;
            $userId = $request->userId;

            $team = Team::find($teamId);

            if (!$team) {
                return response()->json(['message' => 'チームが見つかりません'], 404);
            }

            if ($team->memberUserId !== $userId) {
                return response()->json(['message' => 'キャンセル権限がありません'], 403);
            }

            if ($team->status !== 'pending') {
                return response()->json(['message' => '現在キャンセルできない状態です'], 400);
            }

            // メンバーのキャラクター選択を削除
            TeamCharacter::where('teamId', $teamId)
                ->where('userId', $userId)
                ->delete();

            $team->update([
                'memberUserId' => null,
                'status' => 'waiting'
            ]);

            return response()->json($team, 200);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * チーム解散
     */
    public function disband(Request $request)
    {
        try {
            $teamId = $request->teamId;
            $userId = $request->userId;

            $team = Team::find($teamId);

            if (!$team) {
                return response()->json(['message' => 'チームが見つかりません'], 404);
            }

            if ($team->leaderUserId !== $userId) {
                return response()->json(['message' => '解散権限がありません'], 403);
            }

            DB::transaction(function () use ($team) {
                // チームのキャラクター選択を削除
                TeamCharacter::where('teamId', $team->id)->delete();
                // チームを削除
                $team->delete();
            });

            return response()->json(['message' => 'チームを解散しました'], 200);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * チーム情報の取得
     */
    public function get(Request $request, $teamId)
    {
        try {
            $team = Team::with(['leaderUser', 'memberUser', 'characters.character'])
                ->find($teamId);

            if (!$team) {
                return response()->json(['message' => 'チームが見つかりません'], 404);
            }

            return response()->json($team, 200);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * チーム一覧の取得
     */
    public function list()
    {
        try {
            $teams = Team::with(['leaderUser', 'memberUser'])
                ->where('status', 'ready')
                ->get();

            return response()->json($teams, 200);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * 自分のチーム情報を取得
     */
    public function getMyTeam(Request $request)
    {
        try {
            $userId = $request->user()->id;
            
            $team = Team::where(function ($query) use ($userId) {
                $query->where('leaderUserId', $userId)
                      ->orWhere('memberUserId', $userId);
            })
            ->with(['leaderUser', 'memberUser', 'characters.character'])
            ->first();

            return response()->json($team);
        } catch (Exception $e) {
            return response()->json(['message' => 'チーム情報の取得に失敗しました'], 500);
        }
    }

    // 他のメソッド（承認、キャンセルなど）も同様に実装...
} 
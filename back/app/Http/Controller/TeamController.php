<?php

namespace App\Http\Controller;

use App\Model\Team;
use App\Model\TeamCharacter;
use App\Model\Character;
use App\Model\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TeamController
{
    /**
     * チーム作成
     */
    public function create(Request $request)
    {
        try {
            // firebase_uidから取得
            $userId = $request->attributes->get('firebase_uid');
            if (!$userId) {
                return response()->json(['message' => '認証が必要です'], 401);
            }

            // 既存のチームがないか確認
            $existingTeam = Team::where('leaderUserId', $userId)
                ->orWhere('memberUserId', $userId)
                ->first();

            if ($existingTeam) {
                return response()->json(['message' => '既にチームに所属しています'], 400);
            }

            // トランザクション内でチーム作成を行う
            $team = DB::transaction(function () use ($userId) {
                $team = Team::create([
                    'leaderUserId' => $userId,
                    'status' => 'waiting'
                ]);

                // 作成したチームを再取得してリレーションをロード
                $newTeam = Team::with(['leaderUser', 'memberUser', 'characters.character'])
                    ->find($team->id);

                if (!$newTeam) {
                    throw new Exception('チームの作成に失敗しました');
                }

                return $newTeam;
            });

            return response()->json($team, 201);
        } catch (Exception $e) {
            Log::error('Team creation failed: ' . $e->getMessage());
            return response()->json(['message' => 'チームの作成に失敗しました: ' . $e->getMessage()], 500);
        }
    }

    /**
     * チームに参加
     */
    public function join(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => '認証が必要です'], 401);
            }

            $teamId = $request->teamId;
            $userId = $user->id;  // リクエストから直接取るのではなく、認証済みユーザーのIDを使用

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
            // firebase_uidから取得
            $userId = $request->attributes->get('firebase_uid');
            if (!$userId) {
                return response()->json(['message' => '認証が必要です'], 401);
            }

            $teamId = $request->teamId;
            $characterId = $request->characterId;

            // チームの存在確認とリレーションのロード
            $team = Team::with(['characters', 'leaderUser', 'memberUser'])
                ->where('id', $teamId)
                ->where(function ($query) use ($userId) {
                    $query->where('leaderUserId', $userId)
                        ->orWhere('memberUserId', $userId);
                })
                ->first();

            if (!$team) {
                Log::error('Team not found or user not member:', [
                    'teamId' => $teamId,
                    'userId' => $userId
                ]);
                return response()->json(['message' => 'チームが見つからないか、所属していません'], 404);
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

            // キャラクター選択を保存
            TeamCharacter::create([
                'teamId' => $teamId,
                'userId' => $userId,
                'characterId' => $characterId
            ]);

            // 更新後のチーム情報を返す
            $updatedTeam = Team::with(['leaderUser', 'memberUser', 'characters.character'])
                ->find($teamId);

            return response()->json($updatedTeam, 200);
        } catch (Exception $e) {
            Log::error('Character selection failed: ' . $e->getMessage());
            return response()->json(['message' => 'キャラクター選択に失敗しました'], 500);
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
    public function list(Request $request)
    {
        try {
            $userId = $request->user()->id;

            $teams = Team::with(['leaderUser', 'memberUser'])
                ->where('status', 'waiting')
                ->where('leaderUserId', '!=', $userId)
                ->whereNull('memberUserId') // メンバーが未設定のチームのみ
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
            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => '認証が必要です'], 401);
            }
            $userId = $user->id;

            $team = Team::where(function ($query) use ($userId) {
                $query->where('leaderUserId', $userId)
                      ->orWhere('memberUserId', $userId);
            })
            ->with(['leaderUser', 'memberUser', 'characters.character'])
            ->first();

            if (!$team) {
                return response()->json(null);  // チームが存在しない場合はnullを返す
            }

            return response()->json($team);
        } catch (Exception $e) {
            Log::error('Get my team failed: ' . $e->getMessage());
            return response()->json(['message' => 'チーム情報の取得に失敗しました'], 500);
        }
    }

    // 他のメソッド（承認、キャンセルなど）も同様に実装...
}

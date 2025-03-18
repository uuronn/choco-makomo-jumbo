<?php

namespace App\Http\Controller;

use App\Model\User;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController
{
    /**
     * すべてのユーザーを取得
     */
    public function all(): JsonResponse
    {
        return response()->json(User::all());
    }

    /**
     * ユーザーを作成
     */
    public function create(Request $request)
    {
        try {
            $user = User::create([
                'id' => $request->id,
                'name' => $request->name,
                'email' => $request->email,
                'point' => 1000,
                'photoUrl' => $request->photoUrl,
            ]);

            return response()->json($user, 201);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'ユーザーが作成されませんでした',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ユーザー情報を取得する
     */
    public function getUser($userId)
    {
        $user = User::find($userId);

        if (!$user) return response()->json(['message' => 'User not found'], 404);

        return response()->json($user, 200);
    }

    /**
     * ユーザーが存在するか確認
     */
    public function checkUser($userId)
    {
        $user = User::find($userId);

        if (!$user) return response()->json(['message' => 'User not found'], 404);

        return response()->json(['message' => 'User exists'], 200);
    }

    /**
     * ユーザーのpointを取得
     */
    public function getPoint($userId)
    {
        $user = User::find($userId);

        if (!$user) return response()->json(['message' => 'User not found'], 404);

        return response()->json($user->point, 200);
    }

    /**
     * ユーザーのpointを更新
     */
    public function updatePoint(Request $request, $userId)
    {
        $user = User::find($userId);

        if (!$user) return response()->json(['message' => 'User not found'], 404);

        $additionalPoint = $request->point;

        if (!is_numeric($additionalPoint)) return response()->json(['message' => 'Point must be a number'], 422);

        $user->point = $user->point + (int)$additionalPoint;
        $user->save();

        return response()->json($user, 200);
    }
}

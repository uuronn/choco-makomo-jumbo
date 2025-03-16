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
                'point' => $request->point
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
     * ユーザーが存在するか確認
     */
    public function checkUser(Request $request)
    {
        $user = User::find($request->user_id);

        if (!$user) return response()->json(['message' => 'User not found'], 404);

        return response()->json(['message' => 'User exists'], 200);
    }

    /**
     * ユーザーのpointを更新
     */
    public function updatePoint(Request $request)
    {
        $user = User::find($request->user_id);

        if (!$user) return response()->json(['message' => 'User not found'], 404);

        $additionalPoint = $request->point;

        if (!is_numeric($additionalPoint)) return response()->json(['message' => 'Point must be a number'], 422);

        $user->point = $user->point + (int)$additionalPoint;
        $user->save();

        return response()->json($user, 200);
    }
}

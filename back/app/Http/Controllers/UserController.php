<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(User::all());
    }

    public function store(Request $request)
    {


        try {
            // Create new user
            $user = User::create([
                'id' => $request->id,
                'name' => $request->name,
                'email' => $request->email,
                'point' => $request->point
            ]);

            return response()->json([
                'message' => 'User created successfully',
                'data' => $user
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function checkUser($id)
    {
        // ユーザーが存在するか確認
        $user = User::find($id);

        if ($user) {
            // ユーザーが存在する場合、200 OKを返す
            return response()->json(['message' => 'User exists'], 200);
        }

        // ユーザーが存在しない場合、404 Not Foundを返す
        return response()->json(['message' => 'User not found'], 404);
    }

    public function updatePoint(Request $request, $id)
    {
        // ユーザーを検索
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // リクエストから追加するpointを取得
        $additionalPoint = $request->input('point');

        // バリデーション
        if (!is_numeric($additionalPoint)) {
            return response()->json(['error' => 'Point must be a number'], 422);
        }

        // 現在のpointに追加
        $user->point = $user->point + (int)$additionalPoint;
        $user->save();

        return response()->json([
            'message' => 'Point added successfully',
            'user' => $user
        ], 200);
    }
}


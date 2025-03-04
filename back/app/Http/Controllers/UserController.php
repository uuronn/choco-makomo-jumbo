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

        // ユーザー作成
        $user = User::create([
            'id' => $request->id,
            'name' => $request->name,
            'email' => $request->email,
        ]);

        return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
    }
}


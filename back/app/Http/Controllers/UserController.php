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

    public function store(Request $request): JsonResponse
{
    $validated = $request->validate([
        'id' => 'required|unique:users,id', // IDが一意であることを保証
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email|max:255',
    ]);

    $user = User::create($validated);

    return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
}
}


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
        // Validate the incoming request data
        $validated = $request->validate([
            'id' => 'required|integer|unique:users,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'point' => 'required|numeric'
        ]);

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
}


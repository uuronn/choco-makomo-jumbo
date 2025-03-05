<?php

use App\Http\Controllers\CharacterController;
use App\Http\Controllers\GachaController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Models\UserCharacter;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

Route::get('/test', function () {
    return view('welcome');
});

Route::get('/users', [UserController::class, 'index']);

Route::get('/aaa', [UserController::class, 'index']);

Route::get('/abc', [UserController::class, 'index']);

Route::get('/users/{id}', [UserController::class, 'checkUser']);

Route::put('/users/{id}/point', [UserController::class, 'updatePoint']);

Route::post('/users/{id}/gacha', [GachaController::class, 'gacha']);

Route::get('/users/{id}/characters', [GachaController::class, 'characterList']);

Route::get('/characters', [CharacterController::class, 'index']); // すべてのキャラクターを取得

Route::get('/characters/{id}', [CharacterController::class, 'show']); // 特定のキャラクターを取得

// ユーザーを作成するPOSTルート
Route::post('/users', [UserController::class, 'store'])->withoutMiddleware([VerifyCsrfToken::class]);

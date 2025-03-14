<?php

use App\Http\Controller\CharacterController;
use App\Http\Controller\GachaController;
use App\Http\Controller\RoomController;
use App\Http\Controller\UserCharacterController;
use App\Http\Controller\UserController;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

Route::get('/test', function () {
    return view('welcome');
});

Route::get('/users', [UserController::class, 'index']);

Route::get('/charactersTest', [CharacterController::class, 'index']);


Route::get('/users/{id}', [UserController::class, 'checkUser']);

Route::put('/users/{id}/point', [UserController::class, 'updatePoint']);

Route::post('/users/{id}/gacha', [GachaController::class, 'gacha']);

Route::get('/users/{id}/characters', [GachaController::class, 'characterList']);

Route::put('/characters/training', [GachaController::class, 'trainCharacter']);

Route::get('/rooms', [RoomController::class, 'index']);

Route::post('/rooms', [RoomController::class, 'store']);

Route::put('/rooms/start-battle', [RoomController::class, 'startBattle']);

Route::put('/rooms/join', [RoomController::class, 'join']);

Route::post('/rooms/{roomId}', [RoomController::class, 'show']);

Route::get('/characters', [CharacterController::class, 'index']); // すべてのキャラクターを取得

Route::get('/characters/{id}', [CharacterController::class, 'show']); // 特定のキャラクターを取得

Route::delete('/users/{userId}/character', [UserCharacterController::class, 'destroy']);

// ユーザーを作成するPOSTルート
Route::post('/users', [UserController::class, 'store'])->withoutMiddleware([VerifyCsrfToken::class]);

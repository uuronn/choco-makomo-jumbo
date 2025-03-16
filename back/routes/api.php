<?php

use App\Http\Controller\CharacterController;
use App\Http\Controller\GachaController;
use App\Http\Controller\RoomController;
use App\Http\Controller\UserCharacterController;
use App\Http\Controller\UserController;
use Illuminate\Support\Facades\Route;






Route::post('/users/{id}/gacha', [GachaController::class, 'gacha']);

Route::get('/users/{id}/characters', [GachaController::class, 'characterList']);

Route::put('/training', [UserCharacterController::class, 'levelUp']);

Route::get('/rooms', [RoomController::class, 'index']);

Route::post('/rooms', [RoomController::class, 'store']);

Route::put('/rooms/start-battle', [RoomController::class, 'startBattle']);

Route::post('/rooms/join', [RoomController::class, 'join']);

Route::post('/rooms/action', [RoomController::class, 'processAction']);

Route::post('/rooms/end-battle', [RoomController::class, 'endBattle']);

Route::post('/rooms/{roomId}', [RoomController::class, 'show']);

Route::post('/rooms/simulate-battle', [RoomController::class, 'simulateBattle']);

Route::delete('/users/{userId}/character', [UserCharacterController::class, 'destroy']);

// ユーザーを作成する
Route::post('/users', [UserController::class, 'create']);

// すべてのユーザーを取得する
Route::get('/users', [UserController::class, 'all']);

// ユーザーが存在するか確認
Route::get('/users/{userId}', [UserController::class, 'checkUser']);

// ユーザーのpointを更新
Route::put('/users/{userId}/point', [UserController::class, 'updatePoint']);

// すべてのキャラクターを取得する
Route::get('/characters', [CharacterController::class, 'all']);

// 特定のキャラクターを取得する
Route::get('/characters/{characterId}', [CharacterController::class, 'find']);

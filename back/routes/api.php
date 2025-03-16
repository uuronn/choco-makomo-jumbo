<?php

use App\Http\Controller\CharacterController;
use App\Http\Controller\GachaController;
use App\Http\Controller\RoomController;
use App\Http\Controller\UserCharacterController;
use App\Http\Controller\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/rooms', [RoomController::class, 'index']);

Route::post('/rooms', [RoomController::class, 'store']);

Route::put('/rooms/start-battle', [RoomController::class, 'startBattle']);

Route::post('/rooms/join', [RoomController::class, 'join']);

Route::post('/rooms/action', [RoomController::class, 'processAction']);

Route::post('/rooms/end-battle', [RoomController::class, 'endBattle']);

Route::post('/rooms/{roomId}', [RoomController::class, 'show']);

Route::post('/rooms/simulate-battle', [RoomController::class, 'simulateBattle']);

// ユーザーを作成する
Route::post('/users', [UserController::class, 'create']);

// すべてのユーザーを取得する
Route::get('/users', [UserController::class, 'all']);

// ユーザーが存在するか確認する
Route::get('/users/{userId}', [UserController::class, 'checkUser']);

// ユーザーのpointを更新する
Route::put('/users/{userId}/point', [UserController::class, 'updatePoint']);

// ユーザーのキャラクター一覧を取得する
Route::get('/users/{userId}/characters', [UserCharacterController::class, 'list']);

// ユーザーのキャラクターを全て削除する
Route::delete('/users/{userId}/characters', [UserCharacterController::class, 'delete']);

// ユーザーのキャラクターをレベルアップする
Route::put('/users/{userId}/characters/{characterId}', [UserCharacterController::class, 'levelUp']);

// すべてのキャラクターを取得する
Route::get('/characters', [CharacterController::class, 'all']);

// 特定のキャラクターを取得する
Route::get('/characters/{characterId}', [CharacterController::class, 'find']);

// ガチャを引く
Route::post('/gacha', [GachaController::class, 'gacha']);

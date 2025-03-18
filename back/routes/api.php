<?php

use App\Http\Controller\CharacterController;
use App\Http\Controller\GachaController;
use App\Http\Controller\RoomController;
use App\Http\Controller\roomLogController;
use App\Http\Controller\UserCharacterController;
use App\Http\Controller\UserController;
use Illuminate\Support\Facades\Route;




// ユーザー関連のAPI--------------------------------

// ユーザーを作成する
Route::post('/users', [UserController::class, 'create']);

// すべてのユーザーを取得する
// Route::get('/users', [UserController::class, 'all']);

// すべてのユーザーを取得する
Route::get('/users/{userId}', [UserController::class, 'getUser']);

// ユーザーが存在するか確認する
Route::get('/users/{userId}/checkUser', [UserController::class, 'checkUser']);

// ユーザーのpointを取得する
Route::get('/users/{userId}/point', [UserController::class, 'getPoint']);

// ユーザーのpointを更新する
Route::put('/users/{userId}/point', [UserController::class, 'updatePoint']);

// ユーザーのキャラクター一覧を取得する
Route::get('/users/{userId}/characters', [UserCharacterController::class, 'list']);

// ユーザーのキャラクターを全て削除する
Route::delete('/users/{userId}/characters', [UserCharacterController::class, 'delete']);

// ユーザーのキャラクターをレベルアップする
Route::put('/users/{userId}/characters/{characterId}', [UserCharacterController::class, 'levelUp']);




// キャラクター関連のAPI--------------------------------

// すべてのキャラクターを取得する
Route::get('/characters', [CharacterController::class, 'all']);

// 特定のキャラクターを取得する
Route::get('/characters/{characterId}', [CharacterController::class, 'find']);




// ルーム関連のAPI--------------------------------

// ルーム一覧を取得する
Route::get('/rooms', [RoomController::class, 'list']);

// ルームを全て削除する（テスト用）
Route::delete('/rooms', [RoomController::class, 'allDelete']);

// ルームを作成する
Route::post('/rooms/create', [RoomController::class, 'create']);

// ルームに参加する
Route::post('/rooms/join', [RoomController::class, 'join']);

// ルームのステータスを取得する
Route::get('/{userId}/{roomId}/status', [RoomController::class, 'status']);

// 参加申請を承認
Route::post('/{userId}/{roomId}/approve', [RoomController::class, 'approve']);

// 参加申請を拒否
Route::post('/{userId}/{roomId}/reject', [RoomController::class, 'reject']);

// 通常攻撃を行う
Route::post('{userId}/{roomId}/attack', [RoomController::class, 'attack']);

// 次のターンに進む
Route::post('/{userId}/{roomId}/nextTurn', [RoomController::class, 'nextTurn']);


// ルームログ取得
Route::get('/rooms/{roomId}/log', [roomLogController::class, 'logs']);



Route::put('/rooms/start-battle', [RoomController::class, 'startBattle']);

Route::post('/rooms/action', [RoomController::class, 'processAction']);

Route::post('/rooms/end-battle', [RoomController::class, 'endBattle']);




// ガチャ関連のAPI--------------------------------

// ガチャを引く
Route::post('/gacha', [GachaController::class, 'gacha']);

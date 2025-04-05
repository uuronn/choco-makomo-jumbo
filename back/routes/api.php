<?php

use App\Http\Controller\CharacterController;
use App\Http\Controller\GachaController;
use App\Http\Controller\RoomController;
use App\Http\Controller\RoomLogController;
use App\Http\Controller\UserCharacterController;
use App\Http\Controller\UserController;
use Illuminate\Support\Facades\Route;


// ユーザー関連のAPI--------------------------------

// ユーザーを作成する
// Route::post('/users', [UserController::class, 'create']);

// Route::middleware('firebase.auth')->group(function () {
//     // ユーザーを作成する
//     Route::post('/users', [UserController::class, 'create']);

//     // ユーザーのpointを更新する
//     // Route::put('/users/{userId}/pointtest', [UserController::class, 'updatePointTest']);
// });

Route::middleware(['firebase.auth', 'update.last.activity'])->group(function () {
    // ユーザー作成（初回のみ）
    Route::post('/users', [UserController::class, 'create']);

    // ユーザーのキャラクターをレベルアップ
    Route::put('/users/{userId}/characters/{characterId}', [UserCharacterController::class, 'levelUp']);

    Route::get('/onlineUsers', [UserController::class, 'getOnlineUsers']);

// ユーザーのpointを取得する
Route::get('/users/{userId}/point', [UserController::class, 'getPoint']);

    // 他のルートもここに追加できる
    // Route::put('/users/{userId}/pointtest', [UserController::class, 'updatePointTest']);
});

// Route::middleware('web')->group(function () {
//     // Route::get('/csrf-token', function () {
//     //     return response()->json(['message' => 'CSRF token set']);
//     // });

// });

// Route::middleware(['update.last.activity'])->group(function () {
//     // ...
//     // ユーザーのキャラクターをレベルアップする
// Route::put('/users/{userId}/characters/{characterId}', [UserCharacterController::class, 'levelUp']);


// });


Route::middleware(['restrict.domain'])->put('/users/{userId}/pointTest', [UserController::class, 'updatePointTest']);

// すべてのユーザーを取得する
// Route::get('/users', [UserController::class, 'all']);

// すべてのユーザーを取得する
Route::get('/users/{userId}', [UserController::class, 'getUser']);

// ユーザーが存在するか確認する
Route::get('/users/{userId}/checkUser', [UserController::class, 'checkUser']);



// ユーザーのpointを更新する
Route::put('/users/{userId}/point', [UserController::class, 'updatePoint']);

// ユーザーのキャラクター一覧を取得する
Route::get('/users/{userId}/characters', [UserCharacterController::class, 'list']);

// ユーザーのキャラクターを全て削除する
Route::delete('/users/{userId}/characters', [UserCharacterController::class, 'delete']);




// キャラクター関連のAPI--------------------------------

// すべてのキャラクターを取得する
Route::get('/characters', [CharacterController::class, 'all']);

// 特定のキャラクターを取得する
Route::get('/characters/{characterId}', [CharacterController::class, 'find']);




// ルーム関連のAPI--------------------------------

// ルーム一覧を取得する
Route::get('/rooms', [RoomController::class, 'list']);

// ルームを全て削除する（テスト用）
// Route::delete('/rooms', [RoomController::class, 'allDelete']);

// ルームを作成する
Route::post('/rooms/create', [RoomController::class, 'create']);

// ルームに参加する
Route::post('/rooms/join', [RoomController::class, 'join']);

Route::post('/rooms/{roomId}/cancel', [RoomController::class, 'cancelJoin']);

Route::post('/rooms/{roomId}/cancelCreate', [RoomController::class, 'cancelCreate']);

// ルームのステータスを取得する
Route::get('/{userId}/{roomId}/status', [RoomController::class, 'status']);

// 参加申請を承認
Route::post('/{userId}/{roomId}/approve', [RoomController::class, 'approve']);


// 参加申請を拒否
Route::post('/{userId}/{roomId}/reject', [RoomController::class, 'reject']);

// 通常攻撃を行う
Route::post('{userId}/{roomId}/attack', [RoomController::class, 'attack']);


Route::post('{userId}/{roomId}/surrender', [RoomController::class, 'surrender']);

// スペシャルスキル発動
Route::post('{userId}/{roomId}/skill', [RoomController::class, 'skill']);

// ルームを削除する
Route::delete('{userId}/{roomId}/delete', [RoomController::class, 'delete']);


// 次のターンに進む
Route::post('/{userId}/{roomId}/nextTurn', [RoomController::class, 'nextTurn']);


// ルームログ取得
Route::get('/rooms/{roomId}/log', [RoomLogController::class, 'logs']);


// Route::post('/rooms/{roomId}/cpu-turn', [RoomController::class, 'handleCpuTurn']);

Route::post('/cpu-battle/create', [RoomController::class, 'createCpuBattle']);

Route::post('/rooms/{roomId}/cpu-act', [RoomController::class, 'cpuAct']);



// ガチャ関連のAPI--------------------------------

// ガチャを引く
Route::post('/gacha', [GachaController::class, 'gacha']);

<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

Route::get('/test', function () {
    return view('welcome');
});

Route::get('/users', [UserController::class, 'index']);

Route::get('/aaa', [UserController::class, 'index']);

Route::get('/abc', [UserController::class, 'index']);

Route::get('/users/{id}', [UserController::class, 'checkUser']);

Route::put('/users/{id}/point', [UserController::class, 'updatePoint']);

// ユーザーを作成するPOSTルート
Route::post('/users', [UserController::class, 'store'])->withoutMiddleware([VerifyCsrfToken::class]);

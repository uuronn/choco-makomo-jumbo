<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

Route::get('/test', function () {
    return view('welcome');
});

Route::get('/users', [UserController::class, 'index']);

// ユーザーを作成するPOSTルート
Route::post('/users', [UserController::class, 'store'])->withoutMiddleware([VerifyCsrfToken::class])->middleware('cors');

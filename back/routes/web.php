<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;


// ログイン
Route::post('/login', function (Request $request) {
    $credentials = $request->only('email', 'password');

    if (Auth::attempt($credentials)) {
        $request->session()->regenerate(); // セッション固定攻撃対策
        return response()->json(['message' => 'ok']);
    }

    return response()->json(['message' => 'unauthorized'], 401);
});

Route::get('/{any}', function () {
    return view('welcome'); // React を埋め込んだ Blade
})->where('any', '.*');

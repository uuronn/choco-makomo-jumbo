<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;


Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated'], 401);
})->name('login');
// ログイン
// Route::post('/login', function (Request $request) {
//     $credentials = $request->only('email', 'password');

//     if (Auth::attempt($credentials)) {
//         $request->session()->regenerate(); // セッション固定攻撃対策
//         return response()->json(['message' => 'ok']);
//     }

//     return response()->json(['message' => 'unauthorized'], 401);
// });

Route::middleware('auth')->get('/me', function () {
    $user = Auth::user();

    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'point' => $user->point,
        'rating' => $user->rating,
        'photoUrl' => $user->photoUrl,
        'last_activity_at' => $user->last_activity_at,
    ]);
});


Route::get('/{any}', function () {
    return view('welcome'); // React を埋め込んだ Blade
})->where('any', '.*');

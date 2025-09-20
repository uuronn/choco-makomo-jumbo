<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        api: __DIR__.'/../routes/api.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'firebase.auth' => \App\Http\Middleware\FirebaseAuth::class,
            'update.last.activity' => \App\Http\Middleware\UpdateLastActivity::class,
            // Laravel標準の認証ミドルウェア
            'auth' => Authenticate::class,
        ]);
    })
     ->withExceptions(function (Exceptions $exceptions) {
        // ★ 未認証エラーをキャッチして 401 を返す
        $exceptions->render(function (AuthenticationException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json(['message' => '未ログインです'], 401);
            }
            // SPAなのでリダイレクト先を / にするなど調整可能
            return redirect('/');
        });
    })
->create();

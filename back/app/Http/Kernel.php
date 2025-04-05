<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    protected $routeMiddleware = [
        // 他のミドルウェア
        'update.last.activity' => \App\Http\Middleware\UpdateLastActivity::class,
    ];
}

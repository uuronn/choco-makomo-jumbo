<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class UpdateLastActivity {
    public function handle($request, Closure $next)
    {
        if (Auth::auth()->check()) {
            Auth::auth()->user()->update(['last_activity_at' => now()]);
        }

        return $next($request);
    }
};

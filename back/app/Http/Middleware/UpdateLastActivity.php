<?php

namespace App\Http\Middleware;

use App\Model\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UpdateLastActivity
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $user = Auth::user();
            if ($user instanceof User) { // Eloquentモデルか確認
                $user->update(['last_activity_at' => now()]);
            }
        }

        return $next($request);
    }
}

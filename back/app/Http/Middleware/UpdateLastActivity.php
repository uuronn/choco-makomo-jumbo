<?php

namespace App\Http\Middleware;

use App\Model\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class UpdateLastActivity
{
    public function handle(Request $request, Closure $next)
    {
        // ステップ1: 認証チェック
        Log::info('Checking if user is authenticated');
        if (Auth::check()) {
            Log::info('User is authenticated');

            // ステップ2: ユーザー取得
            $user = Auth::user();
            Log::info('User retrieved', ['user_id' => $user->id ?? 'null']);

            // ステップ3: Userインスタンスか確認
            if ($user instanceof User) {
                Log::info('User is an instance of App\Models\User', ['user' => $user->toArray()]);

                // ステップ4: 更新前を確認
                Log::info('Before update', ['last_activity_at' => $user->last_activity_at]);

                // ステップ5: 更新実行
                $user->update(['last_activity_at' => now()]);
                Log::info('After update', ['last_activity_at' => $user->last_activity_at]);
            } else {
                Log::warning('User is not an instance of App\Models\User', ['class' => get_class($user)]);
            }
        } else {
            Log::info('User is not authenticated');
        }

        return $next($request);
    }
}

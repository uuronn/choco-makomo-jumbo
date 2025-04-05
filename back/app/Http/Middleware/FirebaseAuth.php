<?php
namespace App\Http\Middleware;

use Closure;
use Kreait\Firebase\Contract\Auth;
use App\Model\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth as LaravelAuth;
class FirebaseAuth
{
    public function __construct(protected Auth $auth) {}

    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'トークンが必要です'], 401);
        }

        try {
            $verifiedIdToken = $this->auth->verifyIdToken($token);
            $uid = $verifiedIdToken->claims()->get('sub');

            $user = User::where('id', $uid)->first();

            if (!$user) {
                return response()->json(['message' => 'ユーザーが見つかりません'], 404);
            }

            LaravelAuth::login($user);

            $request->attributes->add(['firebase_uid' => $uid]);

            return $next($request);
        } catch (\Exception $e) {
            return response()->json(['message' => '認証エラー: ' . $e->getMessage()], 401);
        }
    }
}

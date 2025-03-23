<?php
namespace App\Http\Middleware;

use Closure;
use Kreait\Firebase\Contract\Auth;

class FirebaseAuth
{
    protected $auth;

    public function __construct(Auth $auth)
    {
        $this->auth = $auth;
    }

    public function handle($request, Closure $next)
    {
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json(['message' => 'トークンが必要です'], 401);
        }

        try {
            $verifiedIdToken = $this->auth->verifyIdToken($token);
            $uid = $verifiedIdToken->claims()->get('sub');
            $request->attributes->add(['firebase_uid' => $uid]);
            return $next($request);
        } catch (\Exception $e) {
            return response()->json(['message' => '認証エラー: ' . $e->getMessage()], 401);
        }
    }
}

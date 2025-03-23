<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
// use Symfony\Component\HttpFoundation\Response;

class RestrictDomain
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        $allowedDomain = 'choco-makomo-jumbo.vercel.app'; // ホスト名のみ
        $originHost = parse_url($request->header('Origin'), PHP_URL_HOST);

        if (!$originHost || !str_ends_with($originHost, $allowedDomain)) {
            return response()->json(['message' => 'Unauthorized domain'], 403);
        }

        return $next($request);
    }
}

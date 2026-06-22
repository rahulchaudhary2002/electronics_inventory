<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()?->is_superadmin) {
            abort(403, 'Access restricted to superadmins.');
        }

        return $next($request);
    }
}

<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Return null for API routes so Laravel throws AuthenticationException
     * (which our exception handler converts to JSON 401) instead of
     * redirecting to a named route called "login".
     */
    protected function redirectTo(Request $request): ?string
    {
        return $request->expectsJson() ? null : null;
    }
}

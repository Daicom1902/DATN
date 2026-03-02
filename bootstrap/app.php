<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'auth'  => \App\Http\Middleware\Authenticate::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Return JSON for all API routes — prevents "Route [login] not defined" error
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $status = match (true) {
                    $e instanceof \Illuminate\Auth\AuthenticationException             => 401,
                    $e instanceof \Illuminate\Auth\Access\AuthorizationException       => 403,
                    $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException => 404,
                    $e instanceof \Illuminate\Validation\ValidationException           => 422,
                    method_exists($e, 'getStatusCode')                                => $e->getStatusCode(),
                    default                                                            => 500,
                };

                $message = $e instanceof \Illuminate\Validation\ValidationException
                    ? $e->errors()
                    : $e->getMessage();

                return response()->json(['success' => false, 'message' => $message], $status);
            }
        });
    })->create();

<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        channels: __DIR__ . '/../routes/channels.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: [
            '*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })

    // --- PERBAIKAN FINAL DI BLOK INI ---
    ->withBroadcasting(
        __DIR__ . '/../routes/channels.php',
        [
            'prefix' => 'api',
            // Kita gunakan middleware 'web' karena itu sudah
            // mencakup semua yang kita perlukan (EncryptCookies, StartSession)
            // ATAU kita definisikan manual agar cocok dengan routes/api.php
            'middleware' => [
                \Illuminate\Cookie\Middleware\EncryptCookies::class,
                \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
                \Illuminate\Session\Middleware\StartSession::class,
                'auth:sanctum', // Pastikan auth:sanctum ada di akhir
            ]
        ]
    )
    // --- AKHIR PERBAIKAN ---

    ->create();

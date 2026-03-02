<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PromoCodeController;

/*
|--------------------------------------------------------------------------
| API Routes  –  prefix: /api
|--------------------------------------------------------------------------
*/

// ── Auth (public) ─────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);

    Route::middleware('auth:api')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me',      [AuthController::class, 'me']);
    });
});

// ── Products (public read) ────────────────────────────────────────────────
Route::get('products',     [ProductController::class, 'index']);
Route::get('products/{id}',[ProductController::class, 'show']);

// ── Promo code validation (public) ────────────────────────────────────────
Route::post('promo/validate', [PromoCodeController::class, 'validate']);

// ── Orders (guest create + authenticated view own) ────────────────────────
Route::post('orders', [OrderController::class, 'store']);          // guest checkout allowed

Route::middleware('auth:api')->group(function () {
    Route::get('orders/my', [OrderController::class, 'myOrders']); // customer own orders
});

// ── Contact (public submit) ───────────────────────────────────────────────
Route::post('contact', [ContactController::class, 'store']);

// ── Admin routes (authenticated + admin role) ─────────────────────────────
Route::middleware(['auth:api', \App\Http\Middleware\AdminMiddleware::class])->prefix('admin')->group(function () {

    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index']);

    // Products CRUD
    Route::post('products',        [ProductController::class, 'store']);
    Route::put('products/{id}',    [ProductController::class, 'update']);
    Route::delete('products/{id}', [ProductController::class, 'destroy']);

    // Orders management
    Route::get('orders',           [OrderController::class, 'index']);
    Route::get('orders/{id}',      [OrderController::class, 'show']);
    Route::put('orders/{id}',      [OrderController::class, 'update']);
    Route::delete('orders/{id}',   [OrderController::class, 'destroy']);

    // Contacts management
    Route::get('contact',          [ContactController::class, 'index']);
    Route::get('contact/{id}',     [ContactController::class, 'show']);
    Route::delete('contact/{id}',  [ContactController::class, 'destroy']);
});

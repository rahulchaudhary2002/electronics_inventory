<?php

use App\Http\Controllers\BrandController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OutletController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

// All authenticated users
Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard',   'dashboard')->name('dashboard');
    Route::inertia('pos',         'pos')->name('pos');
    Route::inertia('dispatch',    'dispatch')->name('dispatch');
    Route::inertia('maintenance', 'maintenance')->name('maintenance');
    Route::inertia('menu',        'menu')->name('menu');
    Route::resource('categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('brands',     BrandController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('products',   ProductController::class)->only(['index', 'store', 'update', 'destroy']);
});

// Superadmin only
Route::middleware(['auth', 'verified', 'superadmin'])->group(function () {
    Route::resource('outlets', OutletController::class)->only(['index', 'store', 'update', 'destroy']);
});

require __DIR__.'/settings.php';

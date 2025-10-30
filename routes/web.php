<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('welcome');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return inertia('dashboard');
    })->name('dashboard');

    // <-- TAMBAHKAN BARIS INI UNTUK USER MANAGEMENT -->
    Route::resource('users', UserController::class);
});

require __DIR__ . '/auth.php';
require __DIR__ . '/settings.php';

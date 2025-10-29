<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\UserController;
use Inertia\Inertia;


Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/hello/{nama}', function (string $nama) {
    return "Ini Halaman Hello " . $nama . request ()->lengkap;
});

Route::get('/home/{nama}', [HomeController::class, 'index']);

//Route:get('/')
//Route:post('/')
//Route:put('/')
//Route:delete('/')
//Route:patch('/')
//Route:resource()


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Baris ini sudah mencakup semua rute CRUD untuk User:
    // - GET /users (index)
    // - POST /users (store)
    // - GET /users/{user} (show)
    // - GET /users/{user}/edit (edit)
    // - PUT/PATCH /users/{user} (update) <-- Dipakai oleh modal
    // - DELETE /users/{user} (destroy) <-- Dipakai oleh tombol delete
    Route::resource('users', UserController::class);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

// (Syntax error '}' yang ada di file Anda sebelumnya sudah saya hapus)

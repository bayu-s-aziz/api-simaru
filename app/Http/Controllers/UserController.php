<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User; // <-- Perbaikan namespace (sebelumnya 'app')
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash; // <-- Tambahkan impor Hash
use Illuminate\Validation\Rules\Password; // <-- Tambahkan impor Password

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $users = User::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");

        })
        ->paginate(10);

        return Inertia::render('users/index', [
            'users' => $users
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Tidak digunakan, modal menangani ini
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 1. Validasi input dari form modal "Add New"
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users'), // Pastikan email unik
            ],
            'role' => ['required', 'string', Rule::in(['admin', 'user', 'manager'])], // Pastikan role-nya valid
            'password' => ['required', 'string', 'confirmed', Password::defaults()],
        ]);

        // 2. Buat user baru di database
        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']), // Enkripsi password
        ]);

        // 3. Redirect kembali ke halaman index
        // Inertia akan secara otomatis me-refresh data 'users'
        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        // Tidak digunakan, modal menangani ini
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        // 1. Validasi input dari form modal
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id), // Pastikan email unik, kecuali untuk user ini sendiri
            ],
            'role' => ['required', 'string', Rule::in(['admin', 'user', 'manager'])], // Pastikan role-nya valid
        ]);

        // 2. Update data user
        $user->update($validated);

        // 3. Redirect kembali ke halaman index
        // Inertia akan menangani ini dan modal akan tertutup (berdasarkan logika frontend)
        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {

    if ($user->id === Auth::id()) { // <-- GUNAKAN Auth::id()
        return redirect()->route('users.index')->with('error', 'You cannot delete your own account.');
    }

    // Hapus user
    $user->delete();

    // Redirect kembali ke halaman index
    return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }
}

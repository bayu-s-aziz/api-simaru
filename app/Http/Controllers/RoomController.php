<?php

namespace App\Http\Controllers;

use App\Models\Room; // <-- Gunakan model Room
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage; // <-- 1. Tambahkan impor Storage

class RoomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        // Query data rooms
        $rooms = Room::query()
            ->when($search, function ($query, $search) {
                // Cari berdasarkan nama atau nama fakultas
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('faculty_name', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString(); // <-- Tambahkan ini agar search query tetap ada di URL pagination

        // Render view Inertia
        return Inertia::render('rooms/index', [
            'rooms' => $rooms, // Kirim prop 'rooms' ke komponen React
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Tidak digunakan, modal di frontend menangani ini
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 1. Validasi input (photo sekarang adalah file gambar)
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'faculty_name' => 'required|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Validasi sebagai file gambar
            'capacity' => 'required|integer|min:1',
            'status' => ['required', 'string', Rule::in(['draft', 'approved', 'rejected'])],
        ]);

        // 2. Handle file upload jika ada
        if ($request->hasFile('photo')) {
            // Simpan file di 'storage/app/public/uploads/rooms'
            // dan simpan path-nya ke database
            $path = $request->file('photo')->store('uploads/rooms', 'public');
            $validated['photo'] = $path;
        }

        // 3. Buat room baru di database
        Room::create($validated);

        // 4. Redirect kembali ke halaman index
        return redirect('/rooms')->with('success', 'Room created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Room $room)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Room $room)
    {
        // Tidak digunakan, modal di frontend menangani ini
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Room $room)
    {
        // 1. Validasi input
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'faculty_name' => 'required|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Validasi file gambar baru
            'capacity' => 'required|integer|min:1',
            'status' => ['required', 'string', Rule::in(['draft', 'approved', 'rejected'])],
        ]);

        // 2. Handle file upload baru (jika ada)
        if ($request->hasFile('photo')) {
            // Hapus foto lama jika ada
            if ($room->photo) {
                Storage::disk('public')->delete($room->photo);
            }

            // Simpan foto baru dan update path
            $path = $request->file('photo')->store('uploads/rooms', 'public');
            $validated['photo'] = $path;
        }

        // 3. Update data room
        $room->update($validated);

        // 4. Redirect kembali
        return redirect('/rooms')->with('success', 'Room updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Room $room)
    {
        // Hapus file foto dari storage jika ada
        if ($room->photo) {
            Storage::disk('public')->delete($room->photo);
        }

        // Hapus room dari database
        $room->delete();

        // Redirect kembali ke halaman index
        return redirect('/rooms')->with('success', 'Room deleted successfully.');
    }
}

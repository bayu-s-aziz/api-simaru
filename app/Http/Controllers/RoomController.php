<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class RoomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $rooms = Room::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('faculty_name', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('rooms/index', [
            'rooms' => $rooms,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'faculty_name' => 'required|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'capacity' => 'required|integer|min:1',
            'status' => ['required', 'string', Rule::in(['draft', 'approved', 'rejected'])],
        ]);

        // Simpan path relatif ke DB (bukan URL!)
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('uploads/rooms', 'public');
            $validated['photo'] = $path; // → 'uploads/rooms/filename.jpg'
        }

        Room::create($validated);

        // ✅ Gunakan `back()` untuk Inertia (bukan `redirect()`)
        return back()->with('success', 'Room created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'faculty_name' => 'required|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'capacity' => 'required|integer|min:1',
            'status' => ['required', 'string', Rule::in(['draft', 'approved', 'rejected'])],
        ]);

        if ($request->hasFile('photo')) {
            // Hapus foto lama
            if ($room->photo) {
                Storage::disk('public')->delete($room->photo);
            }
            $validated['photo'] = $request->file('photo')->store('uploads/rooms', 'public');
        } else {
            unset($validated['photo']); // Jangan hapus kolom photo jika tidak diubah
        }

        $room->update($validated);

        return back()->with('success', 'Room updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Room $room)
    {
        if ($room->photo) {
            Storage::disk('public')->delete($room->photo);
        }

        $room->delete();

        return back()->with('success', 'Room deleted successfully.');
    }
}

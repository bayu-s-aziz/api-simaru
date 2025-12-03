<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use App\Models\Room;
use Illuminate\Validation\Rule;

class RoomController extends Controller
{
    /**
     * Display a listing of the rooms with optional search & filter.
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->input('search');
        $status = $request->input('status');

        $query = Room::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('faculty_name', 'like', "%{$search}%");
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        $rooms = $query->orderByDesc('created_at')->paginate(10);

        return response()->json($rooms);
    }

    /**
     * Store a newly created room in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'faculty_name' => ['required', 'string', 'max:255'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'capacity' => ['required', 'integer', 'min:1'],
            'status' => ['nullable', 'string', 'in:draft,approved,rejected'],
        ]);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('uploads/rooms', 'public');
            $validated['photo'] = $path; // store relative path
        }

        $room = Room::create([
            'name' => $validated['name'],
            'faculty_name' => $validated['faculty_name'],
            'photo' => $validated['photo'] ?? null,
            'capacity' => $validated['capacity'],
            'status' => $validated['status'] ?? 'draft',
        ]);

        return response()->json([
            'message' => 'Ruangan berhasil ditambahkan.',
            'data' => $room,
        ], 201);
    }

    /**
     * Display the specified room.
     */
    public function show(string $id): JsonResponse
    {
        $room = Room::findOrFail($id);

        return response()->json([
            'data' => $room,
        ]);
    }

    /**
     * Update the specified room in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $room = Room::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'faculty_name' => ['sometimes', 'string', 'max:255'],
            'capacity' => ['sometimes', 'integer', 'min:1'],
            'status' => ['sometimes', 'string', Rule::in(['draft','approved','rejected'])],
            'photo' => ['sometimes', 'nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
        ]);

        if ($request->hasFile('photo')) {
            if ($room->photo) {
                Storage::disk('public')->delete($room->photo);
            }
            $validated['photo'] = $request->file('photo')->store('uploads/rooms', 'public');
        }

        $room->update($validated);
        $room->refresh(); // pastikan nilai terbaru di response

        return response()->json([
            'message' => 'Ruangan berhasil diperbarui.',
            'data' => $room,
        ]);
    }

    /**
     * Remove the specified room from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $room = Room::findOrFail($id);

        if ($room->photo) {
            Storage::disk('public')->delete($room->photo);
        }

        $room->delete();

        return response()->json([
            'message' => 'Ruangan berhasil dihapus.',
        ], 204);
    }
}

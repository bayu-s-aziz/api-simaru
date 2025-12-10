<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use App\Models\Room;
use App\Models\Booking;
use App\Models\BookingDetail;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $bookings = Booking::with(['user', 'bookingDetails.room'])
            ->when($search, function ($query, $search) {
                $query->where('customer_name', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
            })
            ->orderByDesc('created_at')
            ->paginate(10);

        $rooms = Room::All();

        return Inertia::render('bookings/index', [
            'bookings' => $bookings,
            'rooms' => $rooms
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // You can pass available rooms or other data here if needed for the frontend
        return Inertia::render('bookings/create');
    }

    /**
     * Store a newly created booking and its details.
     */
    public function store(Request $request)
    {
        // Validate main booking + nested booking_details
        $validated = $request->validate([
            'tgl' => ['required', 'date'],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'booking_details' => ['required', 'array', 'min:1'],
            'booking_details.*.room_id' => ['required', 'exists:rooms,id'],
            'booking_details.*.start' => ['required', 'date', 'after_or_equal:tgl'],
            'booking_details.*.end' => ['required', 'date', 'after:start'],
        ]);

        // Automatically set user_id to current authenticated user
        $bookingData = [
            'tgl' => $validated['tgl'],
            'user_id' => Auth::id(),
            'customer_name' => $validated['customer_name'],
        ];

        // Create the main booking
        $booking = Booking::create($bookingData);

        // Prepare booking details with booking_id
        $details = collect($validated['booking_details'])->map(function ($detail) use ($booking) {
            return [
                'booking_id' => $booking->id,
                'room_id' => $detail['room_id'],
                'start' => $detail['start'],
                'end' => $detail['end'],
            ];
        })->toArray();

        // Insert all booking details
        BookingDetail::insert($details);

        return redirect()->route('bookings.index')->with('success', 'Booking berhasil dibuat.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Booking $booking)
    {
        $booking->load('bookingDetails');

        return Inertia::render('bookings/edit', [
            'booking' => $booking
        ]);
    }

    /**
     * Update the specified booking and its details.
     */
    public function update(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'tgl' => ['required', 'date'],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'booking_details' => ['required', 'array', 'min:1'],
            'booking_details.*.id' => ['nullable', 'exists:booking_details,id,booking_id,' . $booking->id],
            'booking_details.*.room_id' => ['required', 'exists:rooms,id'],
            'booking_details.*.start' => ['required', 'date', 'after_or_equal:tgl'],
            'booking_details.*.end' => ['required', 'date', 'after:start'],
        ]);

        // Update main booking
        $booking->update([
            'tgl' => $validated['tgl'],
            'customer_name' => $validated['customer_name'],
            // user_id should NOT be updated for security
        ]);

        // Get existing detail IDs for this booking
        $existingIds = $booking->bookingDetails->pluck('id')->toArray();

        $incomingIds = collect($validated['booking_details'])
            ->filter(fn($item) => isset($item['id']))
            ->pluck('id')
            ->toArray();

        // Delete removed details
        $idsToDelete = array_diff($existingIds, $incomingIds);
        if (!empty($idsToDelete)) {
            BookingDetail::whereIn('id', $idsToDelete)->delete();
        }

        // Upsert each detail
        foreach ($validated['booking_details'] as $detail) {
            if (isset($detail['id'])) {
                // Update existing
                BookingDetail::where('id', $detail['id'])
                    ->where('booking_id', $booking->id)
                    ->update([
                        'room_id' => $detail['room_id'],
                        'start' => $detail['start'],
                        'end' => $detail['end'],
                    ]);
            } else {
                // Create new
                BookingDetail::create([
                    'booking_id' => $booking->id,
                    'room_id' => $detail['room_id'],
                    'start' => $detail['start'],
                    'end' => $detail['end'],
                ]);
            }
        }

        return redirect()->route('bookings.index')->with('success', 'Booking berhasil diperbarui.');
    }

    /**
     * Remove the specified booking and its details (cascade delete via DB).
     */
    public function destroy(Booking $booking)
    {
        $booking->delete(); // BookingDetails will be deleted automatically due to foreign key constraint

        return redirect()->back()->with('success', 'Booking berhasil dihapus.');
    }
}

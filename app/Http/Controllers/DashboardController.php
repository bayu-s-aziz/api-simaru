<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Room;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with statistics.
     */
    public function index(): Response
    {
        // Get statistics
        $totalUsers = User::count();
        $totalRooms = Room::count();
        $totalBookings = Booking::count();

        // Get approved rooms
        $approvedRooms = Room::where('status', 'approved')->count();

        // Get draft rooms
        $draftRooms = Room::where('status', 'draft')->count();

        // Get rejected rooms
        $rejectedRooms = Room::where('status', 'rejected')->count();

        // Data for Room Status Chart
        $roomStatusChart = [
            [
                'name' => 'Approved',
                'value' => $approvedRooms,
                'fill' => '#10b981'
            ],
            [
                'name' => 'Draft',
                'value' => $draftRooms,
                'fill' => '#f59e0b'
            ],
            [
                'name' => 'Rejected',
                'value' => $rejectedRooms,
                'fill' => '#ef4444'
            ]
        ];

        // Data for Main Statistics Chart
        $mainStatsChart = [
            [
                'name' => 'Users',
                'value' => $totalUsers,
                'fill' => '#3b82f6'
            ],
            [
                'name' => 'Rooms',
                'value' => $totalRooms,
                'fill' => '#8b5cf6'
            ],
            [
                'name' => 'Bookings',
                'value' => $totalBookings,
                'fill' => '#ec4899'
            ]
        ];

        // Booking trends for last 7 days
        $bookingTrends = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $count = Booking::whereDate('created_at', $date)->count();
            $bookingTrends[] = [
                'date' => $date->format('M d'),
                'bookings' => $count
            ];
        }

        // User registration trends for last 7 days
        $userTrends = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $count = User::whereDate('created_at', $date)->count();
            $userTrends[] = [
                'date' => $date->format('M d'),
                'users' => $count
            ];
        }

        return Inertia::render('dashboard', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalRooms' => $totalRooms,
                'totalBookings' => $totalBookings,
                'approvedRooms' => $approvedRooms,
                'draftRooms' => $draftRooms,
                'rejectedRooms' => $rejectedRooms,
            ],
            'charts' => [
                'roomStatus' => $roomStatusChart,
                'mainStats' => $mainStatsChart,
                'bookingTrends' => $bookingTrends,
                'userTrends' => $userTrends,
            ]
        ]);
    }
}

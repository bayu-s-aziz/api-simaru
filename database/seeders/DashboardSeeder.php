<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Room;
use App\Models\Booking;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DashboardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test users
        User::factory()->count(15)->create();

        // Create test rooms
        Room::factory()->count(5)->create(['status' => 'approved']);
        Room::factory()->count(3)->create(['status' => 'draft']);
        Room::factory()->count(2)->create(['status' => 'rejected']);

        // Create test bookings
        Booking::factory()->count(20)->create();
    }
}

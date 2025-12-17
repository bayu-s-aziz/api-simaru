<?php

namespace Database\Factories;

use App\Models\Room;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Room>
 */
class RoomFactory extends Factory
{
    protected $model = Room::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->word() . ' Room',
            'faculty_name' => fake()->word() . ' Faculty',
            'capacity' => fake()->numberBetween(5, 100),
            'status' => 'approved',
            'photo' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}

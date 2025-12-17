<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'faculty_name',
        'photo',
        'capacity',
        'status',
        'description',
        'price',
    ];

    protected $appends = ['photo_url'];

    public function getPhotoUrlAttribute(): ?string
    {
        if (!$this->photo) {
            return null;
        }
        return Storage::url($this->photo); // converts 'uploads/rooms/xxx.jpg' to '/storage/uploads/rooms/xxx.jpg'
    }
}

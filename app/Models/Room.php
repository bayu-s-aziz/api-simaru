<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $fillable = [
        'name',
        'faculty_name',
        'photo',
        'capacity',
        'status',
    ];
}

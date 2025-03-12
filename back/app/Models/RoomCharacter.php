<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomCharacter extends Model
{
    protected $table = 'room_character';

    protected $fillable = [
        'room_id',
        'character_id',
        'level',
        'life',
        'power',
        'speed',
        'skill',
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}

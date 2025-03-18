<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class RoomLog extends Model
{
    protected $table = 'roomLog';

    protected $fillable = [
        'roomId',
        'actionType',
        'actorUserId',
        'actorCharacterId',
        'targetUserId',
        'targetCharacterId',
        'value',
        'description',
    ];

    public function room()
    {
        return $this->belongsTo(Room::class, 'roomId');
    }
}

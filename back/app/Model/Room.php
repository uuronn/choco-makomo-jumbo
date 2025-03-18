<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Room extends Model
{
    protected $table = 'room';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $hidden = ['created_at', 'updated_at'];

    protected $fillable = ['id', 'hostUserId', 'guestUserId', 'status', 'totalTurns', 'winUserId', 'currentTurnUserId', 'currentTurnCharacterId'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function hostUser()
    {
        return $this->belongsTo(User::class, 'hostUserId');
    }

    public function guestUser()
    {
        return $this->belongsTo(User::class, 'guestUserId');
    }

    public function roomCharacter()
    {
        return $this->hasMany(RoomCharacter::class, 'roomId');
    }

    public function roomLog()
    {
        return $this->hasMany(RoomLog::class, 'roomId', 'id');
    }
}

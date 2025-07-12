<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class DuoRoom extends Model
{
    protected $table = 'duoRoom';
    protected $keyType = 'string';
    public $incrementing = false;
    protected $hidden = ['created_at', 'updated_at'];

    protected $fillable = [
        'id',
        'hostUserId',
        'coHostUserId',
        'guestUserId',
        'coGuestUserId',
        'status',
        'totalTurns',
        'winUserId',
        'currentTurnUserId',
        'currentTurnCharacterId',
    ];

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

    public function coHostUser()
    {
        return $this->belongsTo(User::class, 'coHostUserId');
    }

    public function guestUser()
    {
        return $this->belongsTo(User::class, 'guestUserId');
    }

    public function coGuestUser()
    {
        return $this->belongsTo(User::class, 'coGuestUserId');
    }

    public function characters()
    {
        return $this->hasMany(DuoRoomCharacter::class, 'duoRoomId');
    }
}

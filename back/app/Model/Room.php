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

    protected $fillable = ['id', 'host_user_id', 'guest_user_id', 'status'];

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
        return $this->belongsTo(User::class, 'host_user_id');
    }

    public function guestUser()
    {
        return $this->belongsTo(User::class, 'guest_user_id');
    }

    public function roomCharacter()
    {
        return $this->hasMany(RoomCharacter::class);
    }
}

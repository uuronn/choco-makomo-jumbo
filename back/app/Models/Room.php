<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Room extends Model
{
    protected $table = 'room'; // `room` → `rooms` に修正（複数形が標準）

    protected $keyType = 'string';
    public $incrementing = false;

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
        return $this->belongsTo(User::class, 'host_user_id'); // ホストのユーザー情報を取得
    }

    public function guestUser()
    {
        return $this->belongsTo(User::class, 'guest_user_id'); // ゲストのユーザー情報を取得
    }

    public function roomCharacters()
    {
        return $this->hasMany(RoomCharacter::class);
    }
}

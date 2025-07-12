<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class DuoRoom extends Model
{
    protected $table = 'duoRoom';

    protected $keyType = 'string';
    public $incrementing = false;

    // 不要なタイムスタンプは隠す
    protected $hidden = ['created_at', 'updated_at'];

    // ここに 2人目のホスト／ゲスト用カラムを追加
    protected $fillable = [
        'id',
        'host_user_id',
        'co_host_user_id',       // ← 追加
        'guest_user_id',
        'co_guest_user_id',      // ← ゲスト側2人目も将来想定
        'status',
        'total_turns',
        'win_user_id',
        'current_turn_user_id',
        'current_turn_character_id',
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

    // チームA（ホスト側）1人目
    public function hostUser()
    {
        return $this->belongsTo(User::class, 'host_user_id');
    }

    // チームA（ホスト側）2人目
    public function coHostUser()
    {
        return $this->belongsTo(User::class, 'co_host_user_id');
    }

    // チームB（ゲスト側）1人目
    public function guestUser()
    {
        return $this->belongsTo(User::class, 'guest_user_id');
    }

    // チームB（ゲスト側）2人目
    public function coGuestUser()
    {
        return $this->belongsTo(User::class, 'co_guest_user_id');
    }

    // キャラクターは後でこのリレーションで登録
    public function characters()
    {
        return $this->hasMany(DuoRoomCharacter::class, 'duo_room_id');
    }
}

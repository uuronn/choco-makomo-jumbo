<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class RoomCharacter extends Model
{
    protected $table = 'room_character';

    protected $keyType = 'string'; // UUIDを文字列として扱う
    public $incrementing = false;  // AUTO_INCREMENT を無効化

    protected $fillable = [
        'id', // UUID を追加
        'room_id',
        'character_id',
        'level',
        'life',
        'power',
        'speed',
        'skill',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid(); // UUID を自動生成
            }
        });
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}

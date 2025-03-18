<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class RoomCharacter extends Model
{
    protected $table = 'roomCharacter';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $hidden = ['created_at', 'updated_at'];

    protected $fillable = [
        'id',
        'roomId',
        'characterId',
        'userId',
        'level',
        'maxLife',
        'life',
        'power',
        'speed',
        'evasion',
        'isActive',
    ];

    protected $casts = ['isActive' => 'boolean'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
            if (is_null($model->isActive)) {
                $model->isActive = true;
            }
        });
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    // ここにcharacterリレーションを追加
    public function character()
    {
        return $this->belongsTo(Character::class, 'characterId', 'id');
    }
}

<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class RoomCharacter extends Model
{
    protected $table = 'room_character';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'room_id',
        'character_id',
        'level',
        'life',
        'power',
        'speed',
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

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}

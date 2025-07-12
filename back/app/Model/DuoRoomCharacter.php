<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class DuoRoomCharacter extends Model
{
    protected $table = 'duoRoomCharacter';
    protected $keyType = 'string';
    public $incrementing = false;
    protected $hidden = ['created_at', 'updated_at'];

    protected $fillable = [
        'id',
        'duoRoomId',
        'characterId',
        'userId',
        'level',
        'maxLife',
        'life',
        'power',
        'speed',
        'evasion',
        'critical',
        'isActive',
        'isDead',
        'blockCount',
        'confusionCount',
        'poisonCount',
        'specialSkillTurn',
        'specialUsed',
        'isErrorMode',
    ];

    protected $casts = [
        'isActive' => 'boolean',
        'isDead'   => 'boolean',
    ];

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
            if (is_null($model->isDead)) {
                $model->isDead = false;
            }
        });
    }

    public function duoRoom()
    {
        return $this->belongsTo(DuoRoom::class, 'duoRoomId');
    }

    public function character()
    {
        return $this->belongsTo(Character::class, 'characterId');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'userId');
    }
}

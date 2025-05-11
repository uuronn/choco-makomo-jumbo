<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class TeamCharacter extends Model
{
    protected $table = 'teamCharacter';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'teamId',
        'userId',
        'characterId'
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

    public function team()
    {
        return $this->belongsTo(Team::class, 'teamId');
    }

    public function character()
    {
        return $this->belongsTo(Character::class, 'characterId');
    }
} 
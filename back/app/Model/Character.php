<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Character extends Model
{
    protected $table = 'character';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $hidden = ['created_at', 'updated_at'];

    protected $fillable = [
        'id', 'name', 'type', 'rarity', 'basePower', 'imageUrl', 'baseLife', 'baseSpeed', 'baseEvasion',
        'specialSkillName', 'specialSkillDescription', 'specialSkillTurn'
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
}

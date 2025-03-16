<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Skill extends Model
{
    protected $table = 'skill';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $hidden = ['created_at', 'updated_at'];

    protected $fillable = ['id', 'name', 'description', 'effect_type', 'effect_amount'];

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

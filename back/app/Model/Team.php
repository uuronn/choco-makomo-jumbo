<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Team extends Model
{
    protected $table = 'team';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'leaderUserId',
        'memberUserId',
        'status'
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

    public function characters()
    {
        return $this->hasMany(TeamCharacter::class, 'teamId')->with('character');
    }

    public function leaderUser()
    {
        return $this->belongsTo(User::class, 'leaderUserId');
    }

    public function memberUser()
    {
        return $this->belongsTo(User::class, 'memberUserId');
    }
} 
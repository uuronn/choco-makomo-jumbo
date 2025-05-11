<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class TeamRoom extends Model
{
    protected $table = 'teamRoom';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'team1Id',
        'team2Id',
        'status',
        'winTeamId',
        'currentTurnUserId',
        'currentTurnCharacterId',
        'totalTurns'
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

    public function team1()
    {
        return $this->belongsTo(Team::class, 'team1Id');
    }

    public function team2()
    {
        return $this->belongsTo(Team::class, 'team2Id');
    }
} 
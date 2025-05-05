<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class BattleResultLog extends Model
{
    protected $fillable = [
        'roomId',
        'winnerUserId',
        'loserUserId',
        'winnerRateChange',
        'loserRateChange',
    ];
}

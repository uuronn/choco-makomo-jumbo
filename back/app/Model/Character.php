<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class Character extends Model
{
    protected $table = 'character';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $hidden = ['created_at', 'updated_at'];

    protected $fillable = [
        'id', 'name', 'officialName', 'type', 'basePower', 'baseLife', 'baseSpeed', 'baseEvasion',
        'partySkillName', 'partySkillDescription', 'partySkillCondition',
        'specialSkillName', 'specialSkillDescription', 'baseSpecialSkillTurn', 'passiveSkillName', 'passiveSkillDescription'
    ];

    protected static function boot()
    {
        parent::boot();
    }
}

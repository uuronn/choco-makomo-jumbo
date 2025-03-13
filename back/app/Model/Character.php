<?php

namespace App\Model;

use App\Model\Skill;
use App\Skill\PartyPowerChainSkill;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Character extends Model
{
    protected $table = 'character';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'name', 'type', 'rarity', 'base_power', 'image_url', 'base_life', 'base_speed',
        'active_skill_id', 'passive_skill_id', 'party_skill_id'
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

    public function activeSkill()
    {
        return $this->belongsTo(Skill::class, 'active_skill_id');
    }

    public function passiveSkill()
    {
        return $this->belongsTo(Skill::class, 'passive_skill_id');
    }

    public function partySkill()
    {
        return $this->belongsTo(Skill::class, 'party_skill_id');
    }

    public function getSkillInstance($type)
    {
        $skill = match ($type) {
            'active' => $this->activeSkill,
            'passive' => $this->passiveSkill,
            'party' => $this->partySkill,
            default => null,
        };

        if (!$skill) return null;

        $skillMap = [
            'party_power_chain' => PartyPowerChainSkill::class,
        ];
        $skillClass = $skillMap[$skill->effect_type] ?? null;
        return $skillClass ? new $skillClass($this, $skill->effect_amount) : null;
    }
}

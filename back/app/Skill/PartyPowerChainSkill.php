<?php

namespace App\Skill;

class PartyPowerChainSkill
{
    protected $character;
    protected $baseAmount;

    public function __construct($character, $baseAmount)
    {
        $this->character = $character;
        $this->baseAmount = $baseAmount;
    }

    public function apply($context = null): array
    {
        if (!$context->party) return [];
        $count = $context->party->roomCharacters->count();
        $increase = $this->baseAmount * $count; // 1体:+5, 2体:+10, 3体:+15
        $results = [];
        foreach ($context->party->roomCharacters as $char) {
            $char->power += $increase;
            $char->save();
            $results[] = ['character_id' => $char->character_id, 'effect' => "攻撃力 +{$increase}"];
        }
        return $results;
    }

    public function description(): string
    {
        return "パーティ人数が多いほど攻撃力アップ（1体:+{$this->baseAmount}, 2体:+".($this->baseAmount*2).", 3体:+".($this->baseAmount*3).")";
    }
}

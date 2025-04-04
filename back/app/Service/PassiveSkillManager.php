<?php

namespace App\Service;

use App\Model\Room;
use App\Model\RoomCharacter;

class PassiveSkillManager
{
    /**
     * パッシブスキルを適用する
     * @param Room $room 現在のルーム
     * @param string $eventType イベントタイプ（例: on_attack_hit, before_damage_taken）
     * @param array $context 状況データ（attacker, target, damageなど）
     * @return array 発動したログの配列
     */
    public static function applyPassives($room, $eventType, $context = [])
    {
        $characters = RoomCharacter::where('roomId', $room->id)
            ->where('isDead', false)
            ->with('character')
            ->get();

        $logs = [];
        foreach ($characters as $character) {
            if ($character->character->passiveSkillName) {
                $log = self::applyPassive($character, $eventType, $room, $context);
                if ($log) {
                    $logs[] = [
                        'characterId' => $character->id,
                        'userId' => $character->userId,
                        'description' => $log
                    ];
                }
            }
        }
        return $logs;
    }

    /**
     * 個別のパッシブスキルを適用
     */
    private static function applyPassive($character, $eventType, $room, $context)
    {
        $skillName = $character->character->passiveSkillName;

        switch ($skillName) {
            // Ruby「ActiveRecord」: 自身が通常攻撃を行うたびに、攻撃力とスピードが20%増加
            case 'ActiveRecord':
                if ($eventType === 'on_attack_hit' && isset($context['attacker']) && $context['attacker']->id === $character->id) {
                    $character->update([
                        'power' => $character->power * 1.20,
                        'speed' => $character->speed * 1.20
                    ]);
                    return "{$character->character->name} の「ActiveRecord」発動、攻撃力とスピード20%増加";
                }
                break;

            // Angular「双方向バインディング」: 自身が通常攻撃を受けた時、その攻撃を行った相手に、受けたダメージの50%を与える
            case '双方向バインディング':
                if ($eventType === 'on_damage_taken' && isset($context['target']) && $context['target']->id === $character->id && isset($context['attacker'])) {
                    $reflectDamage = $context['damage'] * 0.5;
                    $context['attacker']->update([
                        'life' => max(0, $context['attacker']->life - $reflectDamage)
                    ]);
                    return "{$character->character->name} の「双方向バインディング」発動、{$reflectDamage}ダメージを{$context['attacker']->character->name}に反射";
                }
                break;

            // Docker「コンテナ化」: 自身が受けるダメージを5%軽減
            case 'コンテナ化':
                if ($eventType === 'before_damage_taken' && isset($context['target']) && $context['target']->id === $character->id) {
                    $context['damage'] *= 0.95; // 5%軽減
                    return "{$character->character->name} の「コンテナ化」発動、受けるダメージ5%軽減";
                }
                break;

            default:
                return null;
        }
        return null;
    }
}

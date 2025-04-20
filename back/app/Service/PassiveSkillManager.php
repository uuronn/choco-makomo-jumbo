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
        $actorUserId = $context['actorUserId'] ?? null;
        $actorCharacterId = $context['actorCharacterId'] ?? null;
        $targetUserId = $context['targetUserId'] ?? null;
        $targetCharacterId = $context['targetCharacterId'] ?? null;

        foreach ($characters as $character) {
            if (!$character->character->passiveSkillName) {
                continue;
            }

            // スキルごとのトリガーと適用条件を定義（characters.php に準拠）
            $skillDefinitions = [
                'セマンティックHTML' => ['trigger' => 'on_action', 'actor_only' => true, 'target_only' => false],
                '並行処理' => ['trigger' => 'on_action', 'actor_only' => true, 'target_only' => false],
                'フレックスボックス' => ['trigger' => 'before_damage_taken', 'actor_only' => false, 'target_only' => true],
                'ES6' => ['trigger' => 'on_action', 'actor_only' => true, 'target_only' => false],
                '型安全な開発' => ['trigger' => 'on_action', 'actor_only' => true, 'target_only' => false],
                'ActiveRecord' => ['trigger' => 'on_attack_hit', 'actor_only' => true, 'target_only' => false],
                '双方向バインディング' => ['trigger' => 'on_damage_taken', 'actor_only' => false, 'target_only' => true],
                'StrictMode' => ['trigger' => 'on_attack_hit', 'actor_only' => true, 'target_only' => false],
                'CoC' => ['trigger' => 'on_attack_hit', 'actor_only' => true, 'target_only' => false],
                'スケーラビリティ' => ['trigger' => 'on_action', 'actor_only' => true, 'target_only' => false],
                'Azure Functions' => ['trigger' => 'on_action', 'actor_only' => true, 'target_only' => false],
                'docker compose up -d' => ['trigger' => 'before_damage_taken', 'actor_only' => false, 'target_only' => true],
                '偽マカフィー' => ['trigger' => 'on_damage_taken', 'actor_only' => false, 'target_only' => true],
                'マルチプラットフォーム' => ['trigger' => 'on_action', 'actor_only' => true, 'target_only' => false],
                'イベントブロック' => ['trigger' => 'on_attack_hit', 'actor_only' => true, 'target_only' => false],
                'ビジュアルプログラミング' => ['trigger' => 'on_action', 'actor_only' => true, 'target_only' => false],
                'ロードバランシング' => ['trigger' => 'on_damage_taken', 'actor_only' => false, 'target_only' => true],
                'LiteSpeed Cache' => ['trigger' => 'turn_end', 'actor_only' => false, 'target_only' => false],
                'Excelオーバーロード' => ['trigger' => 'on_action', 'actor_only' => true, 'target_only' => false],
                'リアルタイムデータベース' => ['trigger' => 'on_action', 'actor_only' => true, 'target_only' => false],
                '軽量設計' => ['trigger' => 'on_action', 'actor_only' => true, 'target_only' => false],
                'ブループリント' => ['trigger' => 'on_action', 'actor_only' => false, 'target_only' => false],
                'run anywhere or debug everywhere' => ['trigger' => 'on_attack_hit', 'actor_only' => true, 'target_only' => false],
                '正規表現' => ['trigger' => 'before_damage_taken', 'actor_only' => false, 'target_only' => true],
                'メモリ操作' => ['trigger' => 'on_action', 'actor_only' => true, 'target_only' => false],
                'オブジェクト指向' => ['trigger' => 'on_action', 'actor_only' => true, 'target_only' => false],
                '高級言語の先駆者' => ['trigger' => 'on_action', 'actor_only' => true, 'target_only' => false],
                'クエリ最適化' => ['trigger' => 'on_action', 'actor_only' => true, 'target_only' => false],
                'HotModuleReplacementPlugin' => ['trigger' => 'on_life_changed', 'actor_only' => false, 'target_only' => true],
            ];

            $skillName = $character->character->passiveSkillName;
            $skill = $skillDefinitions[$skillName] ?? null;

            if (!$skill || $skill['trigger'] !== $eventType) {
                continue;
            }

            // 適用条件チェック
            if ($skill['actor_only'] &&
                ($character->userId !== $actorUserId || $character->characterId !== $actorCharacterId)) {
                continue;
            }

            if ($skill['target_only'] &&
                ($character->userId !== $targetUserId || $character->characterId !== $targetCharacterId)) {
                continue;
            }

            $log = self::applyPassive($character, $eventType, $room, $context);
            if ($log) {
                $logs[] = [
                    'characterId' => $character->id,
                    'userId' => $character->userId,
                    'description' => "[$eventType] $log"
                ];
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
            case 'セマンティックHTML':
                if ($eventType === 'on_action') {
                    $multiplier = $character->isErrorMode ? 1.3 : 1.1;
                    $character->update([
                        'power' => $character->power * $multiplier,
                        'speed' => $character->speed * $multiplier
                    ]);
                    return "{$character->character->name} の「セマンティックHTML」発動、自身が行動するたびに、パワーとスピードを" . ($character->isErrorMode ? '1.3倍' : '1.1倍') . "にする。";
                }
                break;

            case '並行処理':
                if ($eventType === 'on_action') {
                    $updates = ['speed' => $character->speed * 1.1];
                    if ($character->isErrorMode) {
                        $updates['power'] = $character->power * 1.1;
                    }
                    $character->update($updates);
                    $log = "{$character->character->name} の「並行処理」発動、自身が行動するたびに、スピードを1.1倍にする。";
                    if ($character->isErrorMode) {
                        $log .= "（エラー状態でパワーも1.1倍）";
                    }
                    return $log;
                }
                break;

            case 'フレックスボックス':
                if ($eventType === 'before_damage_taken' && isset($context['target']) && $context['target']->id === $character->id) {
                    $reduction = $character->isErrorMode ? 0.7 : 0.9;
                    $context['damage'] *= $reduction;
                    return "{$character->character->name} の「フレックスボックス」発動、自身が受ける通常攻撃のダメージを" . ($character->isErrorMode ? '30%' : '10%') . "軽減する。";
                }
                break;

            case 'ES6':
                if ($eventType === 'on_action') {
                    $multiplier = $character->isErrorMode ? 1.3 : 1.1;
                    $character->update(['power' => $character->power * $multiplier]);
                    return "{$character->character->name} の「ES6」発動、自身が行動するたびに、パワーを" . ($character->isErrorMode ? '1.3倍' : '1.1倍') . "にする。";
                }
                break;

            case '型安全な開発':
                if ($eventType === 'on_action') {
                    $evasionIncrease = $character->isErrorMode ? 2 : 1;
                    $character->update(['evasion' => $character->evasion + $evasionIncrease]);
                    return "{$character->character->name} の「型安全な開発」発動、自身が行動するたびに、回避率を" . ($character->isErrorMode ? '+2%' : '+1%') . "する。";
                }
                break;

            case 'ActiveRecord':
                if ($eventType === 'on_attack_hit' && isset($context['attacker']) && $context['attacker']->id === $character->id) {
                    $multiplier = $character->isErrorMode ? 1.5 : 1.2;
                    $character->update([
                        'power' => $character->power * $multiplier,
                        'speed' => $character->speed * $multiplier
                    ]);
                    return "{$character->character->name} の「ActiveRecord」発動、自身が通常攻撃を行うたびに、パワーとスピードを" . ($character->isErrorMode ? '1.5倍' : '1.2倍') . "にする。";
                }
                break;

            case '双方向バインディング':
                if ($eventType === 'on_damage_taken' && isset($context['target']) && $context['target']->id === $character->id && isset($context['attacker'])) {
                    $reflectRatio = $character->isErrorMode ? 0.6 : 0.5;
                    $reflectDamage = $context['damage'] * $reflectRatio;
                    $context['attacker']->update([
                        'life' => max(0, $context['attacker']->life - $reflectDamage)
                    ]);
                    return "{$character->character->name} の「双方向バインディング」発動、自身が通常攻撃を受けた時、その攻撃を行った相手に、受けたダメージの" . ($character->isErrorMode ? '60%' : '50%') . "を与える。";
                }
                break;

            case 'StrictMode':
                if ($eventType === 'on_attack_hit' && isset($context['attacker']) && $context['attacker']->id === $character->id) {
                    $enemies = RoomCharacter::where('roomId', $room->id)
                        ->where('userId', '!=', $character->userId)
                        ->where('isDead', false)
                        ->inRandomOrder()
                        ->first();
                    if ($enemies) {
                        $additionalDamage = $character->power * ($character->isErrorMode ? 0.75 : 0.5);
                        $newLife = max(0, $enemies->life - $additionalDamage);
                        $enemies->update([
                            'life' => $newLife,
                            'isDead' => $newLife <= 0
                        ]);
                        return "{$character->character->name} の「StrictMode」発動、通常攻撃が命中した時、ランダムな相手のキャラ1体に、自身のパワーの" . ($character->isErrorMode ? '75%' : '50%') . "の追加ダメージを与える。";
                    }
                }
                break;

            case 'CoC':
                if ($eventType === 'on_attack_hit' && isset($context['attacker']) && $context['attacker']->id === $character->id) {
                    $evasionIncrease = $character->isErrorMode ? 3 : 1;
                    $character->update(['evasion' => $character->evasion + $evasionIncrease]);
                    return "{$character->character->name} の「CoC」発動、自身が通常攻撃を行うたびに、回避率を" . ($character->isErrorMode ? '+3%' : '+1%') . "する。";
                }
                break;

            case 'スケーラビリティ':
                if ($eventType === 'on_action') {
                    $healRatio = $character->isErrorMode ? 0.2 : 0.1;
                    $healAmount = $character->maxLife * $healRatio;
                    $newLife = min($character->maxLife, $character->life + $healAmount);
                    $character->update(['life' => $newLife]);
                    return "{$character->character->name} の「スケーラビリティ」発動、自身が行動するたびに、HPを" . ($character->isErrorMode ? '20%' : '10%') . "回復する。";
                }
                break;

            case 'Azure Functions':
                if ($eventType === 'on_action') {
                    $multiplier = $character->isErrorMode ? 1.5 : 1.2;
                    $allies = RoomCharacter::where('roomId', $room->id)
                        ->where('userId', $character->userId)
                        ->where('isDead', false)
                        ->get();
                    foreach ($allies as $ally) {
                        $ally->update(['speed' => $ally->speed * $multiplier]);
                    }
                    return "{$character->character->name} の「Azure Functions」発動、自身が行動するたびに、味方全員のスピードを" . ($character->isErrorMode ? '1.5倍' : '1.2倍') . "にする。";
                }
                break;

            case 'docker compose up -d':
                if ($eventType === 'before_damage_taken' && isset($context['target']) && $context['target']->id === $character->id) {
                    $reduction = $character->isErrorMode ? 0.8 : 0.9;
                    $context['damage'] *= $reduction;
                    return "{$character->character->name} の「docker compose up -d」発動、自身が受ける通常攻撃のダメージを" . ($character->isErrorMode ? '20%' : '10%') . "軽減する。";
                }
                break;

            case '偽マカフィー':
                if ($eventType === 'on_damage_taken' && isset($context['target']) && $context['target']->id === $character->id) {
                    $chance = $character->isErrorMode ? 30 : 10;
                    if (rand(0, 100) < $chance) {
                        $character->update(['blockCount' => $character->blockCount + 1]);
                        return "{$character->character->name} の「偽マカフィー」発動、通常攻撃でダメージを受けた時、" . ($character->isErrorMode ? '30%' : '10%') . "の確率で自身にシールドを一枚付与する。";
                    }
                }
                break;

            case 'マルチプラットフォーム':
                if ($eventType === 'on_action') {
                    $multiplier = $character->isErrorMode ? 1.3 : 1.1;
                    $allies = RoomCharacter::where('roomId', $room->id)
                        ->where('userId', $character->userId)
                        ->where('isDead', false)
                        ->get();
                    foreach ($allies as $ally) {
                        $ally->update([
                            'power' => $ally->power * $multiplier,
                            'speed' => $ally->speed * $multiplier
                        ]);
                    }
                    return "{$character->character->name} の「マルチプラットフォーム」発動、自身が行動するたびに、味方全員のパワーとスピードを" . ($character->isErrorMode ? '1.3倍' : '1.1倍') . "にする。";
                }
                break;

            case 'イベントブロック':
                if ($eventType === 'on_attack_hit' && isset($context['attacker']) && $context['attacker']->id === $character->id) {
                    if (rand(0, 100) < 50) {
                        $isPower = rand(0, 1);
                        $field = $isPower ? 'power' : 'speed';
                        $multiplier = $character->isErrorMode ? 1.5 : 1.3;
                        $character->update([$field => $character->$field * $multiplier]);
                        $fieldName = $isPower ? 'パワー' : 'スピード';
                        return "{$character->character->name} の「イベントブロック」発動、攻撃時、50%の確率で{$fieldName}を" . ($character->isErrorMode ? '1.5倍' : '1.3倍') . "にする。";
                    }
                }
                break;

            case 'ビジュアルプログラミング':
                if ($eventType === 'on_action') {
                    $multiplier = $character->isErrorMode ? 1.5 : 1.2;
                    $character->update([
                        'power' => $character->power * $multiplier,
                        'speed' => $character->speed * $multiplier
                    ]);
                    return "{$character->character->name} の「ビジュアルプログラミング」発動、自身が行動するたびに、パワーとスピードを" . ($character->isErrorMode ? '1.5倍' : '1.2倍') . "にする。";
                }
                break;

            case 'ロードバランシング':
                if ($eventType === 'on_damage_taken' && isset($context['target']) && $context['target']->id === $character->id && isset($context['damage'])) {
                    $reduction = $character->isErrorMode ? 0.8 : 0.7;
                    $reducedDamage = $context['damage'] * $reduction;
                    $context['damage'] = $reducedDamage;

                    $allies = collect($room->roomCharacter)->filter(function ($ally) use ($character) {
                        return $ally->userId === $character->userId && $ally->id !== $character->id && !$ally->isDead;
                    });

                    $allyCount = $allies->count();
                    if ($allyCount > 0) {
                        $damagePerAlly = ($context['damage'] * (1 - $reduction)) / $allyCount;
                        foreach ($allies as $ally) {
                            $newLife = max(0, $ally->life - $damagePerAlly);
                            $ally->update([
                                'life' => $newLife,
                                'isDead' => $newLife <= 0
                            ]);
                        }
                    }

                    return "{$character->character->name} の「ロードバランシング」発動、自身が受ける通常攻撃のダメージを" . ($character->isErrorMode ? '20%' : '30%') . "軽減し、受けたダメージ分を他の味方全員に与える。";
                }
                break;

            case 'LiteSpeed Cache':
                if ($eventType === 'turn_end') {
                    $speedIncrease = $room->totalTurns * 200;
                    $character->update(['speed' => $character->speed + $speedIncrease]);
                    return "{$character->character->name} の「LiteSpeed Cache」発動、合計ラウンド数×200ポイントのスピードを増加する。";
                }
                break;

            case 'Excelオーバーロード':
                if ($eventType === 'on_action') {
                    $healAmount = $character->maxLife * 0.05;
                    $newLife = min($character->maxLife, $character->life + $healAmount);
                    $character->update(['life' => $newLife]);
                    return "{$character->character->name} の「Excelオーバーロード」発動、自身が行動するたびに、HPが5%回復する。";
                }
                break;

            case 'リアルタイムデータベース':
                if ($eventType === 'on_action') {
                    $multiplier = $character->isErrorMode ? 2.0 : 1.2;
                    $allies = RoomCharacter::where('roomId', $room->id)
                        ->where('userId', $character->userId)
                        ->where('isDead', false)
                        ->get();
                    foreach ($allies as $ally) {
                        $ally->update(['speed' => $ally->speed * $multiplier]);
                    }
                    return "{$character->character->name} の「リアルタイムデータベース」発動、自身が行動するたびに、味方全員のスピードを" . ($character->isErrorMode ? '2倍' : '1.2倍') . "にする。";
                }
                break;

            case '軽量設計':
                if ($eventType === 'on_action') {
                    $healRatio = $character->isErrorMode ? 0.2 : 0.1;
                    $allies = RoomCharacter::where('roomId', $room->id)
                        ->where('userId', $character->userId)
                        ->where('isDead', false)
                        ->get();
                    foreach ($allies as $ally) {
                        $healAmount = $ally->maxLife * $healRatio;
                        $newLife = min($ally->maxLife, $ally->life + $healAmount);
                        $ally->update(['life' => $newLife]);
                    }
                    return "{$character->character->name} の「軽量設計」発動、自身が行動するたびに、味方全員のHPを" . ($character->isErrorMode ? '20%' : '10%') . "回復する。";
                }
                break;

            case 'ブループリント':
                if ($eventType === 'on_action') {
                    $multiplier = $character->isErrorMode ? 1.3 : 1.1;
                    $character->update([
                        'power' => $character->power * $multiplier,
                        'speed' => $character->speed * $multiplier
                    ]);
                    return "{$character->character->name} の「ブループリント」発動、味方のキャラが行動する度に、自身のパワー、スピードが" . ($character->isErrorMode ? '1.3倍' : '1.1倍') . "。";
                }
                break;

            case 'run anywhere or debug everywhere':
                if ($eventType === 'on_attack_hit' && isset($context['attacker']) && $context['attacker']->id === $character->id) {
                    $allies = RoomCharacter::where('roomId', $room->id)
                        ->where('userId', $character->userId)
                        ->where('isDead', false)
                        ->get();
                    $isBug = rand(0, 100) < 30;
                    if ($isBug) {
                        foreach ($allies as $ally) {
                            $damage = $ally->life * 0.1;
                            $newLife = max(0, $ally->life - $damage);
                            $ally->update([
                                'life' => $newLife,
                                'isDead' => $newLife <= 0
                            ]);
                        }
                    } else {
                        foreach ($allies as $ally) {
                            $ally->update([
                                'power' => $ally->power * 1.2,
                                'speed' => $ally->speed * 1.2
                            ]);
                        }
                    }
                    return "{$character->character->name} の「run anywhere or debug everywhere」発動、通常攻撃でダメージを与えると、味方全員のパワーとスピードを1.2倍にするが、30%の確率で10%のダメージ。";
                }
                break;

            case '正規表現':
                if ($eventType === 'before_damage_taken' && isset($context['target']) && $context['target']->id === $character->id) {
                    $specialSkillLength = mb_strlen($context['attacker']->character->specialSkillName ?? '');
                    $passiveSkillLength = mb_strlen($context['attacker']->character->passiveSkillName ?? '');
                    $totalLength = $specialSkillLength + $passiveSkillLength;
                    $damageReduction = $totalLength * ($character->isErrorMode ? 50 : 30);
                    $context['damage'] = max(0, $context['damage'] - $damageReduction);
                    return "{$character->character->name} の「正規表現」発動、通常攻撃を受ける際、攻撃時のスペシャルスキル名とパッシブスキル名の合計文字数×" . ($character->isErrorMode ? '50' : '30') . "のダメージを軽減する。";
                }
                break;

            case 'メモリ操作':
                if ($eventType === 'on_action') {
                    $multiplier = $character->isErrorMode ? 1.3 : 1.1;
                    $character->update([
                        'power' => $character->power * $multiplier,
                        'speed' => $character->speed * $multiplier
                    ]);
                    return "{$character->character->name} の「メモリ操作」発動、自身が行動するたびに、自身のパワーとスピードを" . ($character->isErrorMode ? '1.3倍' : '1.1倍') . "にする。";
                }
                break;

            case 'オブジェクト指向':
                if ($eventType === 'on_action') {
                    $multiplier = $character->isErrorMode ? 1.3 : 1.1;
                    $allies = RoomCharacter::where('roomId', $room->id)
                        ->where('userId', $character->userId)
                        ->where('isDead', false)
                        ->get();
                    foreach ($allies as $ally) {
                        $ally->update(['speed' => $ally->speed * $multiplier]);
                    }
                    return "{$character->character->name} の「オブジェクト指向」発動、自身が行動するたびに、味方全員のスピードを" . ($character->isErrorMode ? '1.3倍' : '1.1倍') . "にする。";
                }
                break;

            case '高級言語の先駆者':
                if ($eventType === 'on_action') {
                    $multiplier = $character->isErrorMode ? 1.5 : 1.2;
                    $allies = RoomCharacter::where('roomId', $room->id)
                        ->where('userId', $character->userId)
                        ->where('isDead', false)
                        ->get();
                    foreach ($allies as $ally) {
                        $ally->update(['speed' => $ally->speed * $multiplier]);
                    }
                    return "{$character->character->name} の「高級言語の先駆者」発動、自身が行動するたびに、味方全員のスピードを" . ($character->isErrorMode ? '1.5倍' : '1.2倍') . "にする。";
                }
                break;

            case 'クエリ最適化':
                if ($eventType === 'on_action') {
                    $healRatio = $character->isErrorMode ? 0.15 : 0.1;
                    $healAmount = $character->maxLife * $healRatio;
                    $newLife = min($character->maxLife, $character->life + $healAmount);
                    $character->update(['life' => $newLife]);
                    return "{$character->character->name} の「クエリ最適化」発動、自身が行動するたびに、自身のHPを" . ($character->isErrorMode ? '15%' : '10%') . "回復する。";
                }
                break;

            case 'HotModuleReplacementPlugin':
                if ($eventType === 'on_life_changed' && isset($context['target']) && $context['target']->id === $character->id) {
                    $multiplier = $character->isErrorMode ? 1.2 : 1.1;
                    $character->update([
                        'power' => $character->power * $multiplier,
                        'speed' => $character->speed * $multiplier
                    ]);
                    return "{$character->character->name} の「HotModuleReplacementPlugin」発動、自身のHPに変更があるたびに、パワーとスピードを" . ($character->isErrorMode ? '1.2倍' : '1.1倍') . "にする。";
                }
                break;
        }
        return null;
    }
}

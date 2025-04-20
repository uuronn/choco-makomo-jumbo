<?php

namespace App\Service;

use App\Model\Room;
use App\Model\RoomCharacter;
use Illuminate\Support\Facades\Log;

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
            if ($character->character->passiveSkillName) {
                $skill = [
                    'name' => $character->character->passiveSkillName,
                    'trigger' => $eventType,
                    // actor_only の設定（スキルごとの適用対象を制御）
                    'actor_only' => in_array($character->character->passiveSkillName, [
                        'ActiveRecord', // 自身が攻撃命中時
                        'StrictMode',   // 自身が攻撃命中時
                        'イベントブロック', // 自身が攻撃命中時
                        'Write Once, Run Anywhere or debug everywhere', // 自身が攻撃命中時
                    ]),
                    // target_only: ターゲットに限定するスキル
                    'target_only' => in_array($character->character->passiveSkillName, [
                        '双方向バインディング', // 自身がダメージを受けた時
                        'コンテナ化',           // 自身がダメージを受ける前
                        'フレックスボックスシールド', // 自身がダメージを受ける前
                        'サーバーサイド',      // 自身がダメージを受ける前
                        '互換性',              // 自身がダメージを受ける前
                        'メモリ安全',          // 自身がダメージを受ける前
                        'ヌル安全',            // 自身がダメージを受ける前
                        '正規表現',            // 自身がダメージを受ける前
                    ]),
                ];

                // 適用条件チェック
                if ($skill['trigger'] !== $eventType) {
                    continue;
                }

                // actor_only が true の場合、行動者のみ適用
                if ($skill['actor_only'] &&
                    ($character->userId !== $actorUserId || $character->characterId !== $actorCharacterId)) {
                    continue;
                }

                // target_only が true の場合、ターゲットのみ適用
                if ($skill['target_only'] &&
                    ($character->userId !== $targetUserId || $character->characterId !== $targetCharacterId)) {
                    continue;
                }

                // turn_end や味方全員対象のスキルは全員適用
                if ($eventType === 'turn_end' || !$skill['actor_only'] && !$skill['target_only']) {
                    // 処理続行
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
            case 'ActiveRecord':
                if ($eventType === 'on_attack_hit' && isset($context['attacker']) && $context['attacker']->id === $character->id) {
                    $character->update([
                        'power' => $character->power * 1.20,
                        'speed' => $character->speed * 1.20
                    ]);
                    return "{$character->character->name} の「ActiveRecord」発動、攻撃力とスピード20%増加";
                }
                break;

            case '双方向バインディング':
                if ($eventType === 'on_damage_taken' && isset($context['target']) && $context['target']->id === $character->id && isset($context['attacker'])) {
                    $reflectRatio = $character->isErrorMode ? 0.8 : 0.5;
                    $reflectDamage = $context['damage'] * $reflectRatio;
                    $context['attacker']->update([
                        'life' => max(0, $context['attacker']->life - $reflectDamage)
                    ]);
                    return "{$character->character->name} の「双方向バインディング」発動、{$reflectDamage}ダメージを{$context['attacker']->character->name}に反射";
                }
                break;

            case 'コンテナ化':
                if ($eventType === 'before_damage_taken' && isset($context['target']) && $context['target']->id === $character->id) {
                    $context['damage'] *= 0.95;
                    return "{$character->character->name} の「コンテナ化」発動、受けるダメージ5%軽減";
                }
                break;

            case 'ロードバランシング':
                if ($eventType === 'on_damage_taken' && isset($context['target']) && $context['target']->id === $character->id && isset($context['damage'])) {
                    $originalDamage = $context['damage'];
                    $reducedDamage = $originalDamage * 0.2;
                    $context['damage'] = $reducedDamage;

                    Log::info("ロードバランシング発動: {$character->character->name} が受けるダメージ {$originalDamage} を {$reducedDamage} に軽減");

                    $allies = collect($room->roomCharacter)->filter(function ($ally) use ($character) {
                        return $ally->userId === $character->userId && $ally->id !== $character->id && !$ally->isDead;
                    });

                    foreach ($allies as $ally) {
                        $newLife = max(0, $ally->life - $originalDamage);
                        $ally->update([
                            'life' => $newLife,
                            'isDead' => $newLife <= 0
                        ]);
                        Log::info("ロードバランシング: {$character->character->name} が {$ally->character->name} に {$originalDamage} ダメージを与えました (残りライフ: {$newLife})");
                    }

                    return "{$character->character->name} の「ロードバランシング」発動、ダメージ20%に軽減し、受けたダメージを味方に分配";
                }
                break;

            case 'フレックスボックスシールド':
                if ($eventType === 'before_damage_taken' && isset($context['target']) && $context['target']->id === $character->id) {
                    $context['damage'] *= 0.9;
                    return "{$character->character->name} の「フレックスボックスシールド」発動、受けるダメージ10%軽減";
                }
                break;

            case '並行処理':
                if ($eventType === 'turn_end') {
                    $updates = ['speed' => $character->speed * 1.10];
                    if ($character->isErrorMode) {
                        $updates['power'] = $character->power * 1.10;
                    }
                    $character->update($updates);
                    $log = "{$character->character->name} の「並行処理」発動、スピード10%増加";
                    if ($character->isErrorMode) {
                        $log .= "、エラー状態で攻撃力10%増加";
                    }
                    return $log;
                }
                break;

            case 'セマンティックHTML':
                if ($eventType === 'turn_end') {
                    $multiplier = $character->isErrorMode ? 1.20 : 1.05;
                    $character->update([
                        'power' => $character->power * $multiplier,
                        'speed' => $character->speed * $multiplier
                    ]);
                    $percentage = $character->isErrorMode ? '20%' : '5%';
                    return "{$character->character->name} の「セマンティックHTML」発動、攻撃力とスピード{$percentage}増加";
                }
                break;

            case 'サーバーサイド':
                if ($eventType === 'before_damage_taken' && isset($context['target']) && $context['target']->id === $character->id) {
                    if ($character->life < $character->maxLife * 0.2) {
                        $character->update(['evasion' => $character->evasion + 15]);
                        return "{$character->character->name} の「サーバーサイド」発動、体力20%未満で回避率15%増加";
                    }
                }
                break;

            case '静的型付け':
                if ($eventType === 'before_damage_taken') {
                    $character->update(['power' => $character->power * 1.10]);
                    return "{$character->character->name} の「静的型付け」発動、攻撃力10%増加";
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
                        $additionalDamage = $character->power * 0.5;
                        $newLife = max(0, $enemies->life - $additionalDamage);
                        $enemies->update([
                            'life' => $newLife,
                            'isDead' => $newLife <= 0
                        ]);
                        return "{$character->character->name} の「StrictMode」発動、{$enemies->character->name} に追加ダメージ {$additionalDamage}";
                    }
                }
                break;

            case '規約優先':
                if ($eventType === 'before_damage_taken') {
                    $allies = RoomCharacter::where('roomId', $room->id)
                        ->where('userId', $character->userId)
                        ->where('isDead', false)
                        ->get();
                    foreach ($allies as $ally) {
                        $ally->update(['evasion' => $ally->evasion + 5]);
                    }
                    return "{$character->character->name} の「規約優先」発動、味方全員の回避率5%増加";
                }
                break;

            case 'スケーラビリティ':
                if ($eventType === 'turn_end') {
                    $healAmount = $character->maxLife * 0.05;
                    $newLife = min($character->maxLife, $character->life + $healAmount);
                    $character->update(['life' => $newLife]);
                    return "{$character->character->name} の「スケーラビリティ」発動、体力5%回復";
                }
                break;

            case 'クラウド連携':
                if ($eventType === 'before_damage_taken') {
                    $multiplier = $character-> GRAND_CENTRAL_DISPATCH === 'Azure' ? 1.05 : 1.03;
                    $percentage = $character-> GRAND_CENTRAL_DISPATCH === 'Azure' ? '5%' : '3%';
                    $allies = RoomCharacter::where('roomId', $room->id)
                        ->where('userId', $character->userId)
                        ->where('isDead', false)
                        ->get();
                    foreach ($allies as $ally) {
                        $ally->update(['speed' => $ally->speed * $multiplier]);
                    }
                    return "{$character->character->name} の「クラウド連携」発動、味方全員のスピード{$percentage}増加";
                }
                break;

            case 'データ解析':
                if ($eventType === 'before_damage_taken') {
                    $character->update(['power' => $character->power * 1.10]);
                    return "{$character->character->name} の「データ解析」発動、攻撃力10%増加";
                }
                break;

            case 'ユニックスベース':
                if ($eventType === 'before_damage_taken') {
                    $character->update(['speed' => $character->speed * 1.10]);
                    return "{$character->character->name} の「ユニックスベース」発動、スピード10%増加";
                }
                break;

            case '互換性':
                if ($eventType === 'before_damage_taken' && isset($context['target']) && $context['target']->id === $character->id) {
                    if ($character->life < $character->maxLife * 0.2) {
                        $character->update(['power' => $character->power * 1.15]);
                        return "{$character->character->name} の「互換性」発動、体力20%未満で攻撃力15%増加";
                    }
                }
                break;

            case 'リレーショナル':
                if ($eventType === 'before_damage_taken') {
                    $allies = RoomCharacter::where('roomId', $room->id)
                        ->where('userId', $character->userId)
                        ->where('isDead', false)
                        ->get();
                    foreach ($allies as $ally) {
                        $ally->update(['evasion' => $ally->evasion + 5]);
                    }
                    return "{$character->character->name} の「リレーショナル」発動、味方全員の回避率5%増加";
                }
                break;

            case '堅牢性':
                if ($eventType === 'turn_end') {
                    $healAmount = $character->maxLife * 0.03;
                    $newLife = min($character->maxLife, $character->life + $healAmount);
                    $character->update(['life' => $newLife]);
                    return "{$character->character->name} の「堅牢性」発動、体力3%回復";
                }
                break;

            case 'リアルタイム':
                if ($eventType === 'before_damage_taken') {
                    $character->update(['speed' => $character->speed * 1.10]);
                    return "{$character->character->name} の「リアルタイム」発動、スピード10%増加";
                }
                break;

            case 'クロスプラットフォーム':
                if ($eventType === 'before_damage_taken') {
                    $allies = RoomCharacter::where('roomId', $room->id)
                        ->where('userId', $character->userId)
                        ->where('isDead', false)
                        ->get();
                    foreach ($allies as $ally) {
                        $ally->update(['power' => $ally->power * 1.05]);
                    }
                    return "{$character->character->name} の「クロスプラットフォーム」発動、味方全員の攻撃力5%増加";
                }
                break;

            case 'イベントブロック':
                if ($eventType === 'on_attack_hit' && isset($context['attacker']) && $context['attacker']->id === $character->id) {
                    if (rand(0, 100) < 50) {
                        $isPower = rand(0, 1);
                        $field = $isPower ? 'power' : 'speed';
                        $character->update([$field => $character->$field * 1.30]);
                        $fieldName = $isPower ? '攻撃力' : 'スピード';
                        return "{$character->character->name} の「イベントブロック」発動、{$fieldName}30%増加";
                    }
                }
                break;

            case 'ビジュアルコーディング':
                if ($eventType === 'turn_end') {
                    $healAmount = $character->maxLife * 0.02;
                    $newLife = min($character->maxLife, $character->life + $healAmount);
                    $character->update(['life' => $newLife]);
                    return "{$character->character->name} の「ビジュアルコーディング」発動、体力2%回復";
                }
                break;

            case 'LiteSpeed Cache':
                if ($eventType === 'turn_end') {
                    $character->update(['speed' => $character->speed + 200]);
                    return "{$character->character->name} の「LiteSpeed Cache」発動、スピード200ポイント増加";
                }
                break;

            case '自動HTTPS':
                if ($eventType === 'before_damage_taken') {
                    $baseBlockCount = 3;
                    $totalBlockCount = $baseBlockCount;
                    $hasGo = RoomCharacter::where('roomId', $room->id)
                        ->where('userId', $character->userId)
                        ->whereHas('character', function ($query) {
                            $query->where('name', 'Go');
                        })
                        ->where('isDead', false)
                        ->exists();
                    if ($hasGo) {
                        $totalBlockCount += 1;
                    }
                    $character->update(['blockCount' => $totalBlockCount]);
                    $log = "{$character->character->name} の「自動HTTPS」発動、シールド{$baseBlockCount}枚獲得";
                    if ($hasGo) {
                        $log .= "、Goの効果でさらに1枚追加（合計{$totalBlockCount}枚）";
                    }
                    return $log;
                }
                break;

            case 'ヌル安全':
                if ($eventType === 'before_damage_taken' && isset($context['target']) && $context['target']->id === $character->id) {
                    $context['damage'] *= 0.95;
                    return "{$character->character->name} の「ヌル安全」発動、受けるダメージ5%軽減";
                }
                break;

            case 'Excelオーバーロード':
                if ($eventType === 'turn_end') {
                    $character->update(['power' => $character->power * 1.05]);
                    return "{$character->character->name} の「Excelオーバーロード」発動、攻撃力5%増加";
                }
                break;

            case '軽量設計':
                if ($eventType === 'before_damage_taken') {
                    $character->update(['evasion' => $character->evasion + 10]);
                    return "{$character->character->name} の「軽量設計」発動、回避率10%増加";
                }
                break;

            case 'DOM操作':
                if ($eventType === 'before_damage_taken') {
                    $character->update(['power' => $character->power * 1.10]);
                    return "{$character->character->name} の「DOM操作」発動、攻撃力10%増加";
                }
                break;

            case 'ブループリント':
                if ($eventType === 'turn_end') {
                    $character->update(['power' => $character->power * 1.05]);
                    return "{$character->character->name} の「ブループリント」発動、攻撃力5%増加";
                }
                break;

            case 'Write Once, Run Anywhere or debug everywhere':
                if ($eventType === 'on_attack_hit' && isset($context['attacker']) && $context['attacker']->id === $character->id) {
                    $allies = RoomCharacter::where('roomId', $room->id)
                        ->where('userId', $character->userId)
                        ->where('isDead', false)
                        ->get();
                    $isBug = rand(0, 100) < 20;
                    $multiplier = $isBug ? 0.90 : 1.05;
                    $action = $isBug ? '10%減少' : '5%上昇';
                    foreach ($allies as $ally) {
                        $ally->update([
                            'power' => $ally->power * $multiplier,
                            'speed' => $ally->speed * $multiplier
                        ]);
                    }
                    return "{$character->character->name} の「Write Once, Run Anywhere or debug everywhere」発動、味方全体の攻撃力とスピード{$action}";
                }
                break;

            case '正規表現':
                if ($eventType === 'before_damage_taken' && isset($context['target']) && $context['target']->id === $character->id) {
                    $specialSkillLength = mb_strlen($context['attacker']->character->specialSkillName ?? '');
                    $passiveSkillLength = mb_strlen($context['attacker']->character->passiveSkillName ?? '');
                    $totalLength = $specialSkillLength + $passiveSkillLength;
                    $damageReduction = $totalLength * 30;
                    $context['damage'] = max(0, $context['damage'] - $damageReduction);
                    return "{$character->character->name} の「正規表現」発動、スキル名文字数に基づきダメージ{$damageReduction}軽減";
                }
                break;

            case '低レベル制御':
                if ($eventType === 'before_damage_taken') {
                    $character->update(['speed' => $character->speed * 1.10]);
                    return "{$character->character->name} の「低レベル制御」発動、スピード10%増加";
                }
                break;

            case 'オブジェクト指向':
                if ($eventType === 'before_damage_taken') {
                    $character->update(['power' => $character->power * 1.10]);
                    return "{$character->character->name} の「オブジェクト指向」発動、攻撃力10%増加";
                }
                break;

            case '.NET連携':
                if ($eventType === 'turn_end') {
                    $allies = RoomCharacter::where('roomId', $room->id)
                        ->where('userId', $character->userId)
                        ->where('isDead', false)
                        ->get();
                    foreach ($allies as $ally) {
                        $healAmount = $ally->maxLife * 0.02;
                        $newLife = min($ally->maxLife, $ally->life + $healAmount);
                        $ally->update(['life' => $newLife]);
                    }
                    return "{$character->character->name} の「.NET連携」発動、味方全員の体力2%回復";
                }
                break;

            case '高級言語の先駆者':
                if ($eventType === 'before_damage_taken') {
                    $character->update(['power' => $character->power * 1.10]);
                    return "{$character->character->name} の「高級言語の先駆者」発動、攻撃力10%増加";
                }
                break;

            case 'エレガントな構文':
                if ($eventType === 'before_damage_taken') {
                    $allies = RoomCharacter::where('roomId', $room->id)
                        ->where('userId', $character->userId)
                        ->where('isDead', false)
                        ->get();
                    foreach ($allies as $ally) {
                        $ally->update(['speed' => $ally->speed * 1.03]);
                    }
                    return "{$character->character->name} の「エレガントな構文」発動、味方全員のスピード3%増加";
                }
                break;

            case '可読性':
                if ($eventType === 'before_damage_taken') {
                    $allies = RoomCharacter::where('roomId', $room->id)
                        ->where('userId', $character->userId)
                        ->where('isDead', false)
                        ->get();
                    foreach ($allies as $ally) {
                        $ally->update(['evasion' => $ally->evasion + 5]);
                    }
                    return "{$character->character->name} の「可読性」発動、味方全員の回避率5%増加";
                }
                break;

            case 'メモリ安全':
                if ($eventType === 'before_damage_taken' && isset($context['target']) && $context['target']->id === $character->id) {
                    $context['damage'] *= 0.95;
                    return "{$character->character->name} の「メモリ安全」発動、受けるダメージ5%軽減";
                }
                break;

            case 'クエリ最適化':
                if ($eventType === 'before_damage_taken') {
                    $character->update(['speed' => $character->speed * 1.10]);
                    return "{$character->character->name} の「クエリ最適化」発動、スピード10%増加";
                }
                break;

            default:
                return null;
        }
        return null;
    }
}

<?php

namespace App\Service\PartyBonuses;

use App\Model\Room;
use App\Model\RoomCharacter;

class AutoHTTPS implements PartyBonus {
    private $requiredIds = ['caddy'];

    public function supports(array $characterIds): bool {
        return in_array('caddy', $characterIds);
    }

    public function apply(Room $room, array $characterIds, array &$context): ?string {
        $userId = $context['userId'] ?? null; // ホストまたはゲストの userId
        if (!$userId) {
            return null; // userId がない場合はスキップ
        }

        $baseBlockCount = 3;
        $totalBlockCount = $baseBlockCount;
        $hasGo = RoomCharacter::where('roomId', $room->id)
            ->where('userId', $userId) // 同じパーティの Go をチェック
            ->whereIn('characterId', ['go'])
            ->where('isDead', false)
            ->exists();
        if ($hasGo) {
            $totalBlockCount += 1;
        }

        RoomCharacter::where('roomId', $room->id)
            ->where('userId', $userId) // 対象パーティのみ
            ->where('isDead', false)
            ->update(['blockCount' => $totalBlockCount]);

        $partyLabel = $context['isHost'] ? 'ホスト' : 'ゲスト';
        $log = "「自動HTTPS」発動、{$partyLabel}のパーティにシールド{$baseBlockCount}枚付与";
        if ($hasGo) {
            $log .= "、Goの効果でさらに1枚追加（合計{$totalBlockCount}枚）";
        }
        return $log;
    }
}

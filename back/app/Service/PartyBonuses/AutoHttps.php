<?php

namespace App\Service\PartyBonuses;

use App\Model\Room;
use App\Model\RoomCharacter;
use Illuminate\Support\Facades\Cache;

class AutoHttps implements PartyBonus {
    private $requiredIds = ['caddy'];

    public function supports(array $characterIds): bool {
        return in_array('caddy', $characterIds);
    }

    public function apply(Room $room, array $characterIds, array &$context): ?string {
        $baseBlockCount = 3;
        $totalBlockCount = $baseBlockCount;
        $hasGo = Cache::remember("room:{$room->id}:hasGo", 60, fn() => RoomCharacter::where('roomId', $room->id)
            ->whereIn('characterId', ['go'])
            ->where('isDead', false)
            ->exists());
        if ($hasGo) {
            $totalBlockCount += 1;
        }
        RoomCharacter::where('roomId', $room->id)
            ->where('isDead', false)
            ->update(['blockCount' => $totalBlockCount]);
        $log = "「自動HTTPS」発動、味方全員にシールド{$baseBlockCount}枚付与";
        if ($hasGo) {
            $log .= "、Goの効果でさらに1枚追加（合計{$totalBlockCount}枚）";
        }
        return $log;
    }
}

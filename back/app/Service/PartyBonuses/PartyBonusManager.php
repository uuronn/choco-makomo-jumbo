<?php
namespace App\Service;
use App\Model\Room;
use App\Model\RoomLog;
use App\Service\PartyBonuses\MajorFrameworks;
use App\Service\PartyBonuses\AutoHttps;

class PartyBonusManager {
    private static $bonusMap = [
        '三大フロントエンドフレームワーク' => MajorFrameworks::class, // キー名をテーマに合わせて修正
        '自動HTTPS' => AutoHttps::class,
    ];

    public static function applyPartyBonuses(Room $room, array $hostCharacterIds, array $guestCharacterIds, array $context = []) {
        $characterIds = array_unique(array_merge($hostCharacterIds, $guestCharacterIds));
        $logs = [];

        foreach (self::$bonusMap as $bonusName => $bonusClass) {
            $bonus = new $bonusClass();
            if ($bonus->supports($characterIds)) {
                $log = $bonus->apply($room, $characterIds, $context);
                if ($log) {
                    $logs[] = [
                        'roomId' => $room->id,
                        'actionType' => 'party_bonus',
                        'description' => $log,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
        }

        // RoomLog に一括保存
        if ($logs) {
            RoomLog::insert($logs);
        }

        return $logs;
    }
}

<?php
namespace App\Service;
use App\Model\Room;
use App\Model\RoomLog;
use App\Service\PartyBonuses\MajorFrameworks;
use App\Service\PartyBonuses\AutoHttps;

class PartyBonusManager {
    private static $bonusMap = [
        '三大フロントエンドフレームワーク' => MajorFrameworks::class,
        '自動HTTPS' => AutoHTTPS::class,
    ];
    public static function applyPartyBonuses(Room $room, array $hostCharacterIds, array $guestCharacterIds, array $context = []) {
        $logs = [];
        if (!empty($hostCharacterIds)) {
            $hostContext = ['userId' => $room->hostUserId, 'isHost' => true];
            foreach (self::$bonusMap as $bonusName => $bonusClass) {
                $bonus = new $bonusClass();
                if ($bonus->supports($hostCharacterIds)) {
                    $log = $bonus->apply($room, $hostCharacterIds, $hostContext);
                    if ($log) $logs[] = ['roomId' => $room->id, 'actionType' => 'party_bonus', 'description' => $log, 'created_at' => now(), 'updated_at' => now()];
                }
            }
        }
        if (!empty($guestCharacterIds)) {
            $guestContext = ['userId' => $room->guestUserId, 'isHost' => false];
            foreach (self::$bonusMap as $bonusName => $bonusClass) {
                $bonus = new $bonusClass();
                if ($bonus->supports($guestCharacterIds)) {
                    $log = $bonus->apply($room, $guestCharacterIds, $guestContext);
                    if ($log) $logs[] = ['roomId' => $room->id, 'actionType' => 'party_bonus', 'description' => $log, 'created_at' => now(), 'updated_at' => now()];
                }
            }
        }
        if ($logs) RoomLog::insert($logs);
        return $logs;
    }
}

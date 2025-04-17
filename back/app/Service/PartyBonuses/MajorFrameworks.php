<?php
namespace App\Service\PartyBonuses;
use App\Model\Room;
use App\Model\RoomCharacter;
use Illuminate\Support\Facades\DB;

class MajorFrameworks implements PartyBonus {
    private $requiredIds = ['vue', 'react', 'angular'];

    public function supports(array $characterIds): bool {
        return count(array_intersect($this->requiredIds, $characterIds)) >= 3;
    }

    public function apply(Room $room, array $characterIds, array &$context): ?string {
        $bonusMultiplier = 1.10; // 10%アップ

        RoomCharacter::where('roomId', $room->id)
            ->where('isDead', false)
            ->update([
                'power' => DB::raw("power * $bonusMultiplier"),
                'speed' => DB::raw("speed * $bonusMultiplier"),
                'life' => DB::raw("life * $bonusMultiplier"),
                'evasion' => DB::raw("evasion * $bonusMultiplier"),
            ]);

        return "「三大フロントエンドフレームワーク」発動、味方全員のステータス10%増加";
    }
}

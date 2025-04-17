<?php

namespace App\Service\PartyBonuses;

use App\Model\Room;

interface PartyBonus {
    public function supports(array $characterIds): bool;
    public function apply(Room $room, array $characterIds, array &$context): ?string;
}

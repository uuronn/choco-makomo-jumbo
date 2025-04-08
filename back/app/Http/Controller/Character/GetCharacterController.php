<?php

namespace App\Http\Controller\Character;

use App\Model\Character;
use Illuminate\Http\JsonResponse;

readonly class GetCharacterController
{
    /**
     * 特定のキャラクターを取得する
     *
     * @param string $characterId
     * @return JsonResponse
     */
    public function __invoke(string $characterId): JsonResponse
    {
        $character = Character::find($characterId);

        if (!$character) return response()->json(['message' => 'Character not found'], 404);

        return response()->json($character, 200);
    }
}

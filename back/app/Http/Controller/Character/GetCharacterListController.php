<?php

namespace App\Http\Controller\Character;

use App\Model\Character;
use Illuminate\Http\JsonResponse;

readonly class GetCharacterListController
{
    /**
     * すべてのキャラクターを取得する
     *
     * @return JsonResponse
     */
    public function __invoke(): JsonResponse
    {
        $characterList = Character::all();

        if ($characterList->isEmpty()) return response()->json(['message' => 'CharacterList not found'], 404);

        return response()->json($characterList, 200);
    }
}

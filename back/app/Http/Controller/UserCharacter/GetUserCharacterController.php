<?php

namespace App\Http\Controller\UserCharacter;

use App\Service\User\UserService;
use App\Service\UserCharacter\UserCharacterService;
use Illuminate\Http\JsonResponse;

readonly class GetUserCharacterController
{
    private UserService $userService;
    private UserCharacterService $userCharacterService;

    public function __construct(UserService $userService, UserCharacterService $userCharacterService)
    {
        $this->userService = $userService;
        $this->userCharacterService = $userCharacterService;
    }

    /**
     * 特定のキャラクターを取得する
     * @param string $userId ユーザーID
     * @param string $characterId キャラクターID
     * @return JsonResponse
     */
    public function __invoke(string $userId, string $characterId): JsonResponse
    {
        $user = $this->userService->findUser($userId);

        $userCharacter = $this->userCharacterService->getUserCharacter($user->id, $characterId);

        if (!$userCharacter) {
            return response()->json(['message' => 'Character not found'], 404);
        }

        $baseCharacter = $userCharacter->character;

        // レスポンス用にデータを整形
        $characterData = [
            // UserCharacter（変動値）
            'userId' => $userCharacter->userId,
            'characterId' => $userCharacter->characterId,
            'level' => $userCharacter->level,
            'life' => $userCharacter->life,
            'power' => $userCharacter->power,
            'speed' => $userCharacter->speed,

            // Character（固定値）
            'name' => $baseCharacter->name,
            'type' => $baseCharacter->type,
            'baseEvasion' => $baseCharacter->baseEvasion,
            'baseCritical' => $baseCharacter->baseCritical,
            'partySkillName' => $baseCharacter->partySkillName,
            'partySkillDescription' => $baseCharacter->partySkillDescription,
            'partySkillCondition' => $baseCharacter->partySkillCondition,
            'passiveSkillName' => $baseCharacter->passiveSkillName,
            'passiveSkillDescription' => $baseCharacter->passiveSkillDescription,
            'specialSkillName' => $baseCharacter->specialSkillName,
            'specialSkillDescription' => $baseCharacter->specialSkillDescription,
            'baseSpecialSkillTurn' => $baseCharacter->baseSpecialSkillTurn,
        ];

        return response()->json($characterData, 200);
    }
}

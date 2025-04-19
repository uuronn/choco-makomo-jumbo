<?php

namespace App\Http\Controller\UserCharacter;

use App\Service\User\UserService;
use App\Service\UserCharacter\UserCharacterService;
use Illuminate\Http\JsonResponse;

readonly class GetUserCharacterListController
{
    private UserService $userService;
    private UserCharacterService $userCharacterService;

    public function __construct(UserService $userService, UserCharacterService $userCharacterService)
    {
        $this->userService = $userService;
        $this->userCharacterService = $userCharacterService;
    }

    /**
     * すべてのキャラクターを取得する
     * @param string $userId ユーザーID
     * @return JsonResponse
     */
    public function __invoke(string $userId): JsonResponse
    {
        $user = $this->userService->findUser($userId);

        $userCharacterList = $this->userCharacterService->getUserCharacterList($user->id);

        // レスポンス用にデータを整形
        $characterList = $userCharacterList->map(function ($userCharacter) {
            $baseCharacter = $userCharacter->character;

            return [
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
                'partySkillName' => $baseCharacter->partySkillName,
                'partySkillDescription' => $baseCharacter->partySkillDescription,
                'partySkillCondition' => $baseCharacter->partySkillCondition,
                'passiveSkillName' => $baseCharacter->passiveSkillName,
                'passiveSkillDescription' => $baseCharacter->passiveSkillDescription,
                'specialSkillName' => $baseCharacter->specialSkillName,
                'specialSkillDescription' => $baseCharacter->specialSkillDescription,
                'baseSpecialSkillTurn' => $baseCharacter->baseSpecialSkillTurn,
            ];
        });

        return response()->json($characterList, 200);
    }
}

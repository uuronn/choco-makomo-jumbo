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
            $character = $userCharacter->character;

            return [
                // UserCharacter（変動値）
                'userId' => $userCharacter->userId,
                'characterId' => $userCharacter->characterId,
                'level' => $userCharacter->level,
                'life' => $userCharacter->life,
                'power' => $userCharacter->power,
                'speed' => $userCharacter->speed,
                // Character（固定値）
                'name' => $character->name,
                'type' => $character->type,
                'baseEvasion' => $character->baseEvasion, // TODO: 多分変動になる（装備機能も後に実装するから）
                'specialSkillName' => $character->specialSkillName,
                'specialSkillDescription' => $character->specialSkillDescription,
                'specialSkillTurn' => $character->specialSkillTurn,
                'passiveSkillName' => $character->passiveSkillName,
                'passiveSkillDescription' => $character->passiveSkillDescription,
            ];
        });

        return response()->json($characterList, 200);
    }
}

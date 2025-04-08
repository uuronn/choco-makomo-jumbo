<?php

namespace App\Services;

use App\Model\UserCharacter;
use Exception;

class UserCharacterService
{
    /**
     * ユーザーのキャラ一覧を取得する
     * @param string $userId ユーザーID
     * @return UserCharacter ユーザーキャラのリスト
     * @throws Exception ユーザーキャラが見つからない場合
     */
    public function getUserCharacterList(string $userId)
    {
        $userCharacterList = UserCharacter::where('userId', $userId)
            ->with('character')
            ->get();

        if ($userCharacterList->isEmpty()) throw new Exception('UserCharacter not found', 404);

        return $userCharacterList;
    }

    // /**
    //  * キャラが重複してるかチェック
    //  */
    // public function hasCharacter(int $userId, int $characterId): bool
    // {
    //     return UserCharacter::where('userId', $userId)
    //         ->where('characterId', $characterId)
    //         ->exists();
    // }

    // /**
    //  * 新しいユーザーキャラを作る（ガチャ用）
    //  */
    // public function createUserCharacter(int $userId, Character $character): UserCharacter
    // {
    //     $userCharacter = new UserCharacter([
    //         'userId' => $userId,
    //         'characterId' => $character->id,
    //         'life' => $character->baseLife,
    //         'power' => $character->basePower,
    //         'speed' => $character->baseSpeed,
    //         'evasion' => $character->baseEvasion,
    //         'level' => 1,
    //     ]);
    //     $userCharacter->save();
    //     return $userCharacter;
    // }
}

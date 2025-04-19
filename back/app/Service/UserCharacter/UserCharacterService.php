<?php

namespace App\Service\UserCharacter;

use App\Model\Character;
use App\Model\UserCharacter;
use Exception;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Throwable;

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

    /**
     * 特定のユーザーキャラを強化する
     * @param string $userId ユーザーID
     * @param string $characterId キャラクターID
     * @param int $life 体力の増加量
     * @param int $power 攻撃力の増加量
     * @param int $speed 速度の増加量
     * @return void
     * @throws Exception ユーザーキャラが見つからない場合、またはレベルが最大値を超える場合
     */
    public function levelUpUserCharacter(string $userId, string $characterId, int $life, int $power, int $speed): void
    {
        $userCharacter = UserCharacter::where('userId', $userId)
            ->where('characterId', $characterId)
            ->first();

        if (!$userCharacter) {
            throw new Exception('UserCharacter not found', 404);
        }

        $totalIncrease = $life + $power + $speed;
        if ($userCharacter->level + $totalIncrease > 500) {
            throw new Exception('レベルが最大値（500）を超えます', 400);
        }

        $userCharacter->life += $life;
        $userCharacter->power += $power;
        $userCharacter->speed += $speed;
        $userCharacter->level += $totalIncrease;

        UserCharacter::where('userId', $userId)
            ->where('characterId', $characterId)
            ->update([
                'life' => $userCharacter->life,
                'power' => $userCharacter->power,
                'speed' => $userCharacter->speed,
                'level' => $userCharacter->level,
            ]);
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

    /**
     * 新しいユーザーキャラクターを作成する（ガチャ用）
     *
     * @param int $userId ユーザーID
     * @param Character $character キャラクター
     * @return UserCharacter 作成されたユーザーキャラクター
     */
    public function gachaUserCharacter(int $userId, Character $character): UserCharacter
    {
        try {
            DB::beginTransaction();

            $userCharacter = new UserCharacter([
                'userId' => $userId,
                'characterId' => $character->id,
                'life' => $character->baseLife,
                'power' => $character->basePower,
                'speed' => $character->baseSpeed,
                'level' => 0,
            ]);

            $userCharacter->save();

            DB::commit();

            return $userCharacter;
        } catch (Throwable $e) {
            DB::rollBack();

            throw new RuntimeException('ユーザーキャラクターの作成に失敗しました', 500);
        }
    }
}


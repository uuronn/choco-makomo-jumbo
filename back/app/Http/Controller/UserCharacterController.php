<?php

namespace App\Http\Controller;

use App\Model\UserCharacter;

class UserCharacterController
{
    /**
     * 指定されたユーザーのキャラクターを全削除
     */
    public function destroy($userId, $characterId)
    {
        $deleted = UserCharacter::deleteUserCharacter($userId, $characterId);

        if ($deleted) {
            return response()->json([
                'message' => 'UserCharacter deleted successfully'
            ], 200);
        } else {
            return response()->json([
                'message' => 'UserCharacter not found'
            ], 404);
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\UserCharacter;
use Illuminate\Http\Request;

class UserCharacterController extends Controller
{
    /**
     * 指定されたユーザーのキャラクターを削除
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

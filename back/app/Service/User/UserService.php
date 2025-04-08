<?php

use App\Model\User;

class UserService
{
    /**
     * ユーザーを取得する
     * @param string $userId ユーザーID
     * @return User ユーザーモデル
     * @throws Exception ユーザーが見つからない場合
     */
    public function findUser(string $userId): User
    {
        $user = User::find($userId);

        if (!$user) throw new Exception('User not found', 404);

        return $user;
    }
}

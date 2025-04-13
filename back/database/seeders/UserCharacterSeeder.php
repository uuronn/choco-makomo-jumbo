<?php

namespace Database\Seeders;

use App\Model\User;
use App\Model\Character;
use App\Model\UserCharacter;
use Illuminate\Database\Seeder;

class UserCharacterSeeder extends Seeder
{
    public function run(): void
    {
        // メールアドレスでユーザーを特定
        $user = User::where('email', 'uuronprogram@gmail.com')->first();

        if (!$user) {
            throw new \Exception('メールアドレス「uuronprogram@gmail.com」に該当するユーザーが存在しません。');
        }

        // characters.phpからキャラクターのデータを読み込む
        $characters = require_once __DIR__ . '/data/characters.php';

        // キャラクターを中間テーブルに登録
        foreach ($characters as $characterData) {
            // キャラクターが既にcharactersテーブルに存在するか確認
            $character = Character::firstOrCreate(
                ['id' => $characterData['id']],
                [
                    'name' => $characterData['name'],
                    'officialName' => $characterData['officialName'] ?? null,
                    'type' => $characterData['type'],
                    'basePower' => $characterData['basePower'],
                    'baseLife' => $characterData['baseLife'],
                    'baseSpeed' => $characterData['baseSpeed'],
                    'baseEvasion' => $characterData['baseEvasion'],
                    'specialSkillName' => $characterData['specialSkillName'],
                    'specialSkillDescription' => $characterData['specialSkillDescription'],
                    'specialSkillTurn' => $characterData['specialSkillTurn'],
                    'passiveSkillName' => $characterData['passiveSkillName'],
                    'passiveSkillDescription' => $characterData['passiveSkillDescription'],
                ]
            );

            // 中間テーブルにユーザーとキャラクターの関連を登録
            UserCharacter::create([
                'userId' => $user->id,
                'characterId' => $character->id,
                'level' => 1, // 初期レベル（必要に応じて変更）
                'life' => $characterData['baseLife'],
                'power' => $characterData['basePower'],
                'speed' => $characterData['baseSpeed'],
                'evasion' => $characterData['baseEvasion'],
            ]);
        }
    }
}

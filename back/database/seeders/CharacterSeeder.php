<?php

namespace Database\Seeders;

use App\Model\Character;
use Illuminate\Database\Seeder;

class CharacterSeeder extends Seeder
{
    public function run(): void
    {
        $characterList = [
            [
                'name' => 'Ruby',
                'type' => '言語',
                'rarity' => 5,
                'base_power' => 1000,
                'base_life' => 2000,
                'base_speed' => 80,
                'base_evasion' => 7,
                'specialSkillType' => 'boost_attack', // 味方単体の攻撃力アップ
                'specialTurnRequirement' => 5,
                'image_url' => '/character/ruby.webp',
            ],
            [
                'name' => 'PHP',
                'type' => '言語',
                'rarity' => 3,
                'base_power' => 600,
                'base_life' => 1000,
                'base_speed' => 60,
                'base_evasion' => 4,
                'specialSkillType' => 'area_attack', // 敵全体にダメージ
                'specialTurnRequirement' => 6,
                'image_url' => '/character/php.webp',
            ],
            [
                'name' => 'Swift',
                'type' => '言語',
                'rarity' => 4,
                'base_power' => 800,
                'base_life' => 1000,
                'base_speed' => 70,
                'base_evasion' => 6,
                'specialSkillType' => 'heal_all', // 味方全体を回復
                'specialTurnRequirement' => 4,
                'image_url' => '/character/swift.webp',
            ],
            [
                'name' => 'CSS',
                'type' => '言語',
                'rarity' => 1,
                'base_power' => 100,
                'base_life' => 1000,
                'base_speed' => 10,
                'base_evasion' => 2,
                'specialSkillType' => null, // スキルなし
                'specialTurnRequirement' => null,
                'image_url' => '/character/css.webp',
            ],
            [
                'name' => 'Go',
                'type' => '言語',
                'rarity' => 6,
                'base_power' => 1800,
                'base_life' => 2000,
                'base_speed' => 100,
                'base_evasion' => 9,
                'specialSkillType' => 'sacrifice', // 単体大ダメージ + 自己犠牲
                'specialTurnRequirement' => 7,
                'image_url' => '/character/go.webp',
            ],
            [
                'name' => 'html',
                'type' => '言語',
                'rarity' => 5,
                'base_power' => 300,
                'base_life' => 1000,
                'base_speed' => 100,
                'base_evasion' => 8,
                'specialSkillType' => 'boost_speed', // 味方単体のスピードアップ
                'specialTurnRequirement' => 3,
                'image_url' => '/character/html.webp',
            ],
            [
                'name' => 'node.js',
                'type' => '実行環境',
                'rarity' => 6,
                'base_power' => 3100,
                'base_life' => 4000,
                'base_speed' => 100,
                'base_evasion' => 9,
                'specialSkillType' => 'stun_all', // 敵全体をスタン
                'specialTurnRequirement' => 8,
                'image_url' => '/character/nodejs.webp',
            ],
            [
                'name' => 'react',
                'type' => 'フレームワーク',
                'rarity' => 2,
                'base_power' => 1100,
                'base_life' => 2000,
                'base_speed' => 200,
                'base_evasion' => 10,
                'specialSkillType' => 'boost_evasion', // 味方単体の回避率アップ
                'specialTurnRequirement' => 4,
                'image_url' => '/character/react.webp',
            ],
            [
                'name' => 'rust',
                'type' => '言語',
                'rarity' => 3,
                'base_power' => 1100,
                'base_life' => 2000,
                'base_speed' => 150,
                'base_evasion' => 8,
                'specialSkillType' => 'single_attack', // 敵単体に大ダメージ
                'specialTurnRequirement' => 5,
                'image_url' => '/character/rust.webp',
            ],
            [
                'name' => 'angular',
                'type' => 'フレームワーク',
                'rarity' => 4,
                'base_power' => 1000,
                'base_life' => 2000,
                'base_speed' => 120,
                'base_evasion' => 7,
                'specialSkillType' => 'heal_single', // 味方単体を回復
                'specialTurnRequirement' => 4,
                'image_url' => '/character/angular.webp',
            ],
            [
                'name' => 'aws',
                'type' => 'クラウド',
                'rarity' => 5,
                'base_power' => 2000,
                'base_life' => 3000,
                'base_speed' => 90,
                'base_evasion' => 6,
                'specialSkillType' => 'area_debuff_power', // 敵全体の攻撃力ダウン
                'specialTurnRequirement' => 6,
                'image_url' => '/character/aws.webp',
            ],
            [
                'name' => 'docker',
                'type' => 'コンテナー',
                'rarity' => 4,
                'base_power' => 700,
                'base_life' => 1000,
                'base_speed' => 60,
                'base_evasion' => 5,
                'specialSkillType' => 'boost_all_power', // 味方全体の攻撃力アップ
                'specialTurnRequirement' => 5,
                'image_url' => '/character/docker.webp',
            ],
            [
                'name' => 'mysql',
                'type' => 'データベース',
                'rarity' => 2,
                'base_power' => 600,
                'base_life' => 1000,
                'base_speed' => 50,
                'base_evasion' => 3,
                'specialSkillType' => 'single_debuff_power', // 敵単体の攻撃力ダウン
                'specialTurnRequirement' => 3,
                'image_url' => '/character/mysql.webp',
            ],
            [
                'name' => 'azure',
                'type' => 'クラウド',
                'rarity' => 5,
                'base_power' => 1500,
                'base_life' => 2000,
                'base_speed' => 90,
                'base_evasion' => 6,
                'specialSkillType' => 'area_heal', // 味方全体に小回復
                'specialTurnRequirement' => 5,
                'image_url' => '/character/azure.webp',
            ],
            [
                'name' => 'gcp',
                'type' => 'クラウド',
                'rarity' => 5,
                'base_power' => 1000,
                'base_life' => 2000,
                'base_speed' => 130,
                'base_evasion' => 8,
                'specialSkillType' => 'boost_all_speed', // 味方全体のスピードアップ
                'specialTurnRequirement' => 6,
                'image_url' => '/character/gcp.webp',
            ],
            [
                'name' => 'git',
                'type' => 'バージョン管理',
                'rarity' => 2,
                'base_power' => 300,
                'base_life' => 1000,
                'base_speed' => 80,
                'base_evasion' => 5,
                'specialSkillType' => 'single_boost_life', // 味方単体の最大HPアップ
                'specialTurnRequirement' => 3,
                'image_url' => '/character/git.webp',
            ],
            [
                'name' => 'github',
                'type' => 'バージョン管理',
                'rarity' => 4,
                'base_power' => 900,
                'base_life' => 2000,
                'base_speed' => 110,
                'base_evasion' => 7,
                'specialSkillType' => 'area_boost_evasion', // 味方全体の回避率アップ
                'specialTurnRequirement' => 5,
                'image_url' => '/character/github.webp',
            ],
            [
                'name' => 'gitlab',
                'type' => 'バージョン管理',
                'rarity' => 3,
                'base_power' => 700,
                'base_life' => 1000,
                'base_speed' => 75,
                'base_evasion' => 5,
                'specialSkillType' => 'single_stun', // 敵単体をスタン
                'specialTurnRequirement' => 4,
                'image_url' => '/character/gitlab.webp',
            ],
            [
                'name' => 'javascript',
                'type' => '言語',
                'rarity' => 4,
                'base_power' => 1200,
                'base_life' => 2000,
                'base_speed' => 130,
                'base_evasion' => 8,
                'specialSkillType' => 'area_attack', // 敵全体にダメージ
                'specialTurnRequirement' => 7,
                'image_url' => '/character/javascript.webp',
            ],
            [
                'name' => 'postgresql',
                'type' => 'データベース',
                'rarity' => 3,
                'base_power' => 700,
                'base_life' => 1000,
                'base_speed' => 65,
                'base_evasion' => 4,
                'specialSkillType' => 'single_heal', // 味方単体を回復
                'specialTurnRequirement' => 4,
                'image_url' => '/character/postgresql.webp',
            ],
            [
                'name' => 'supabase',
                'type' => 'データベース',
                'rarity' => 4,
                'base_power' => 900,
                'base_life' => 1000,
                'base_speed' => 75,
                'base_evasion' => 5,
                'specialSkillType' => 'boost_all_life', // 味方全体の最大HPアップ
                'specialTurnRequirement' => 5,
                'image_url' => '/character/supabase.webp',
            ],
            [
                'name' => 'unity',
                'type' => 'ゲームエンジン',
                'rarity' => 5,
                'base_power' => 1600,
                'base_life' => 2000,
                'base_speed' => 95,
                'base_evasion' => 6,
                'specialSkillType' => 'area_debuff_speed', // 敵全体のスピードダウン
                'specialTurnRequirement' => 6,
                'image_url' => '/character/unity.webp',
            ],
            [
                'name' => 'vue',
                'type' => 'フレームワーク',
                'rarity' => 4,
                'base_power' => 1100,
                'base_life' => 2000,
                'base_speed' => 140,
                'base_evasion' => 8,
                'specialSkillType' => 'single_boost_speed', // 味方単体のスピードアップ
                'specialTurnRequirement' => 4,
                'image_url' => '/character/vue.webp',
            ],
            [
                'name' => 'linux',
                'type' => 'オペレーティングシステム',
                'rarity' => 4,
                'base_power' => 900,
                'base_life' => 2000,
                'base_speed' => 85,
                'base_evasion' => 6,
                'specialSkillType' => 'area_stun', // 敵全体をスタン
                'specialTurnRequirement' => 6,
                'image_url' => '/character/linux.webp',
            ],
            [
                'name' => 'mac',
                'type' => 'オペレーティングシステム',
                'rarity' => 3,
                'base_power' => 700,
                'base_life' => 1000,
                'base_speed' => 70,
                'base_evasion' => 5,
                'specialSkillType' => 'single_debuff_evasion', // 敵単体の回避率ダウン
                'specialTurnRequirement' => 4,
                'image_url' => '/character/mac.webp',
            ],
            [
                'name' => 'Ruby on Rails',
                'type' => 'フレームワーク',
                'rarity' => 5,
                'base_power' => 1200,
                'base_life' => 2000,
                'base_speed' => 90,
                'base_evasion' => 6,
                'specialSkillType' => 'boost_all_attack', // 味方全体の攻撃力アップ
                'specialTurnRequirement' => 6,
                'image_url' => '/character/rubyonrails.webp',
            ],
            [
                'name' => 'windows',
                'type' => 'オペレーティングシステム',
                'rarity' => 3,
                'base_power' => 700,
                'base_life' => 1000,
                'base_speed' => 60,
                'base_evasion' => 4,
                'specialSkillType' => 'single_attack', // 敵単体に大ダメージ
                'specialTurnRequirement' => 5,
                'image_url' => '/character/windows.webp',
            ],
        ];

        foreach ($characterList as $character) {
            Character::create($character);
        }
    }
}

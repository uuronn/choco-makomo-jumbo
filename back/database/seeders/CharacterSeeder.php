<?php

namespace Database\Seeders;

use App\Model\Character;
use Illuminate\Database\Seeder;

class CharacterSeeder extends Seeder
{
    public function run(): void
    {
        $characterList = [
            // 言語 (Language)
            // CSS
            [
                'name' => 'CSS',
                'type' => '言語',
                'rarity' => 1,
                'base_power' => 340,
                'base_life' => 3000,
                'base_speed' => 10,
                'base_evasion' => 40,
                'specialSkillType' => null,
                'specialSkillDescription' => null,
                'specialTurnRequirement' => 0,
                'image_url' => '/character/css.webp',
            ],
            // Go
            [
                'name' => 'Go',
                'type' => '言語',
                'rarity' => 5,
                'base_power' => 560,
                'base_life' => 3000,
                'base_speed' => 100,
                'base_evasion' => 9,
                'specialSkillType' => 'ゴルーチンラッシュ',
                'specialSkillDescription' => '自身の攻撃力の2倍分のダメージ相手キャラ全員に与える',
                'specialTurnRequirement' => 14,
                'image_url' => '/character/go.webp',
            ],
            // html
            [
                'name' => 'html',
                'type' => '言語',
                'rarity' => 5,
                'base_power' => 300,
                'base_life' => 5000,
                'base_speed' => 100,
                'base_evasion' => 2,
                'specialSkillType' => 'セマンティックHTML',
                'specialSkillDescription' => '味方全員の回避率に30%をプラスする',
                'specialTurnRequirement' => 10,
                'image_url' => '/character/html.webp',
            ],
            // Javascript
            [
                'name' => 'Javascript',
                'type' => '言語',
                'rarity' => 4,
                'base_power' => 600,
                'base_life' => 2600,
                'base_speed' => 230,
                'base_evasion' => 8,
                'specialSkillType' => 'LiveScript',
                'specialSkillDescription' => '敵全員の次ターンをスキップする',
                'specialTurnRequirement' => 10,
                'image_url' => '/character/javascript.webp',
            ],
            // PHP
            [
                'name' => 'PHP',
                'type' => '言語',
                'rarity' => 3,
                'base_power' => 200,
                'base_life' => 4000,
                'base_speed' => 60,
                'base_evasion' => 10,
                'specialSkillType' => null,
                'specialSkillDescription' => null,
                'specialTurnRequirement' => 0,
                'image_url' => '/character/php.webp',
            ],
            // Ruby
            [
                'name' => 'Ruby',
                'type' => '言語',
                'rarity' => 5,
                'base_power' => 230,
                'base_life' => 3000,
                'base_speed' => 100,
                'base_evasion' => 2,
                'specialSkillType' => null,
                'specialSkillDescription' => null,
                'specialTurnRequirement' => 0,
                'image_url' => '/character/ruby.webp',
            ],
            // Swift
            [
                'name' => 'Swift',
                'type' => '言語',
                'rarity' => 4,
                'base_power' => 800,
                'base_life' => 3000,
                'base_speed' => 100,
                'base_evasion' => 20,
                'specialSkillType' => null,
                'specialSkillDescription' => null,
                'specialTurnRequirement' => 0,
                'image_url' => '/character/swift.webp',
            ],
            // Typescript
            [
                'name' => 'Typescript',
                'type' => '言語',
                'rarity' => 4,
                'base_power' => 1000,
                'base_life' => 2300,
                'base_speed' => 30,
                'base_evasion' => 10,
                'specialSkillType' => null,
                'specialSkillDescription' => null,
                'specialTurnRequirement' => 0,
                'image_url' => '/character/typescript.webp',
            ],

            // フレームワーク (Framework)
            // Angular
            [
                'name' => 'Angular',
                'type' => 'フレームワーク',
                'rarity' => 4,
                'base_power' => 200,
                'base_life' => 2200,
                'base_speed' => 20,
                'base_evasion' => 0,
                'specialSkillType' => '依存性の注入',
                'specialSkillDescription' => '味方全員の最大体力25%分を回復する',
                'specialTurnRequirement' => 14,
                'image_url' => '/character/angular.webp',
            ],
            // React
            [
                'name' => 'React',
                'type' => 'フレームワーク',
                'rarity' => 6,
                'base_power' => 630,
                'base_life' => 2800,
                'base_speed' => 100,
                'base_evasion' => 10,
                'specialSkillType' => null,
                'specialSkillDescription' => null,
                'specialTurnRequirement' => 0,
                'image_url' => '/character/react.webp',
            ],
            // Vue
            [
                'name' => 'Vue',
                'type' => 'フレームワーク',
                'rarity' => 4,
                'base_power' => 1000,
                'base_life' => 2000,
                'base_speed' => 140,
                'base_evasion' => 5,
                'specialSkillType' => null,
                'specialSkillDescription' => null,
                'specialTurnRequirement' => 0,
                'image_url' => '/character/vue.webp',
            ],
            // Ruby on Rails
            [
                'name' => 'Ruby on Rails',
                'type' => 'フレームワーク',
                'rarity' => 5,
                'base_power' => 400,
                'base_life' => 2000,
                'base_speed' => 90,
                'base_evasion' => 6,
                // 'specialSkillType' => 'Eloquentストライク',
                'specialSkillType' => null,
                'specialSkillDescription' => null,
                'specialTurnRequirement' => 10,
                'image_url' => '/character/rubyonrails.webp',
            ],

            // クラウド (Cloud)
            // AWS
            [
                'name' => 'AWS',
                'type' => 'クラウド',
                'rarity' => 5,
                'base_power' => 400,
                'base_life' => 3000,
                'base_speed' => 90,
                'base_evasion' => 6,
                'specialSkillType' => null,
                'specialSkillDescription' => null,
                'specialTurnRequirement' => 0,
                'image_url' => '/character/aws.webp',
            ],
            // Azure
            [
                'name' => 'Azure',
                'type' => 'クラウド',
                'rarity' => 5,
                'base_power' => 780,
                'base_life' => 2100,
                'base_speed' => 90,
                'base_evasion' => 6,
                'specialSkillType' => null,
                'specialSkillDescription' => null,
                'specialTurnRequirement' => 0,
                'image_url' => '/character/azure.webp',
            ],
            // GCP
            [
                'name' => 'GCP',
                'type' => 'クラウド',
                'rarity' => 5,
                'base_power' => 620,
                'base_life' => 2200,
                'base_speed' => 130,
                'base_evasion' => 8,
                'specialSkillType' => null,
                'specialSkillDescription' => null,
                'specialTurnRequirement' => 0,
                'image_url' => '/character/gcp.webp',
            ],

            // コンテナー (Container)
            // Docker
            [
                'name' => 'Docker',
                'type' => 'コンテナー',
                'rarity' => 5,
                'base_power' => 300,
                'base_life' => 4000,
                'base_speed' => 70,
                'base_evasion' => 1,
                'specialSkillType' => 'docker compose up',
                'specialSkillDescription' => '味方全員の体力を50%回復',
                'specialTurnRequirement' => 20,
                'image_url' => '/character/docker.webp',
            ],

            // オペレーティングシステム (Operating System)
            // Linux
            [
                'name' => 'Linux',
                'type' => 'オペレーティングシステム',
                'rarity' => 4,
                'base_power' => 100,
                'base_life' => 5000,
                'base_speed' => 10,
                'base_evasion' => 1,
                'specialSkillType' => 'rm -rf /',
                'specialSkillDescription' => null,
                'specialTurnRequirement' => 40,
                'image_url' => '/character/linux.webp',
            ],
            // Mac
            [
                'name' => 'Mac',
                'type' => 'オペレーティングシステム',
                'rarity' => 3,
                'base_power' => 600,
                'base_life' => 1600,
                'base_speed' => 700,
                'base_evasion' => 1,
                'specialSkillType' => null,
                'specialSkillDescription' => null,
                'specialTurnRequirement' => 0,
                'image_url' => '/character/mac.webp',
            ],
            // windows
            [
                'name' => 'windows',
                'type' => 'オペレーティングシステム',
                'rarity' => 3,
                'base_power' => 700,
                'base_life' => 2600,
                'base_speed' => 60,
                'base_evasion' => 4,
                'specialSkillType' => 'IEを削除',
                'specialSkillDescription' => '味方全員の体力を40%回復',
                'specialTurnRequirement' => 5,
                'image_url' => '/character/windows.webp',
            ],

            // データベース (Database)
            // Mysql
            [
                'name' => 'Mysql',
                'type' => 'データベース',
                'rarity' => 2,
                'base_power' => 100,
                'base_life' => 3000,
                'base_speed' => 100,
                'base_evasion' => 15,
                'specialSkillType' => 'SQLインジェクション',
                'specialSkillDescription' => '敵全員の攻撃力とスピードを入れ替える',
                'specialTurnRequirement' => 20,
                'image_url' => '/character/mysql.webp',
            ],
            // Postgres
            [
                'name' => 'Postgres',
                'type' => 'データベース',
                'rarity' => 3,
                'base_power' => 320,
                'base_life' => 3400,
                'base_speed' => 10,
                'base_evasion' => 1,
                'specialSkillType' => 'SQLインジェクション',
                'specialSkillDescription' => '敵全員の攻撃力とスピードを入れ替える',
                'specialTurnRequirement' => 20,
                'image_url' => '/character/postgresql.webp',
            ],
            // Supabase
            [
                'name' => 'Supabase',
                'type' => 'データベース',
                'rarity' => 4,
                'base_power' => 900,
                'base_life' => 1900,
                'base_speed' => 600,
                'base_evasion' => 20,
                'specialSkillType' => null,
                'specialSkillDescription' => null,
                'specialTurnRequirement' => 0,
                'image_url' => '/character/supabase.webp',
            ],

            // ゲームエンジン (Game Engine)
            // Unity
            [
                'name' => 'Unity',
                'type' => 'ゲームエンジン',
                'rarity' => 5,
                'base_power' => 620,
                'base_life' => 2000,
                'base_speed' => 250,
                'base_evasion' => 20,
                'specialSkillType' => '物理エンジン操作',
                'specialSkillDescription' => '敵全員のスピードが90%ダウン',
                'specialTurnRequirement' => 12,
                'image_url' => '/character/unity.webp',
            ],
        ];
        // $characterList = [
        //     [
        //         'name' => 'git',
        //         'type' => 'バージョン管理',
        //         'rarity' => 2,
        //         'base_power' => 300,
        //         'base_life' => 1000,
        //         'base_speed' => 80,
        //         'base_evasion' => 5,
        //         'specialSkillType' => 'single_boost_life', // 味方単体の最大HPアップ
        //         'specialTurnRequirement' => 3,
        //         'image_url' => '/character/git.webp',
        //     ],
        //     [
        //         'name' => 'github',
        //         'type' => 'バージョン管理',
        //         'rarity' => 4,
        //         'base_power' => 900,
        //         'base_life' => 2000,
        //         'base_speed' => 110,
        //         'base_evasion' => 7,
        //         'specialSkillType' => 'area_boost_evasion', // 味方全体の回避率アップ
        //         'specialTurnRequirement' => 5,
        //         'image_url' => '/character/github.webp',
        //     ],
        //     [
        //         'name' => 'gitlab',
        //         'type' => 'バージョン管理',
        //         'rarity' => 3,
        //         'base_power' => 700,
        //         'base_life' => 1000,
        //         'base_speed' => 75,
        //         'base_evasion' => 5,
        //         'specialSkillType' => 'single_stun', // 敵単体をスタン
        //         'specialTurnRequirement' => 4,
        //         'image_url' => '/character/gitlab.webp',
        //     ],






        // ];

        foreach ($characterList as $character) {
            Character::create($character);
        }
    }
}

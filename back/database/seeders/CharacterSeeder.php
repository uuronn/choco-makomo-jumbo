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
                'basePower' => 340,
                'baseLife' => 3000,
                'baseSpeed' => 10,
                'baseEvasion' => 40,
                'specialSkillName' => null,
                'specialSkillDescription' => null,
                'specialSkillTurn' => 0,
                'passiveSkillName' => null,
                'passiveSkillDescription' => null,
                'imageUrl' => '/character/css.webp',
            ],
            // Go
            [
                'name' => 'Go',
                'type' => '言語',
                'rarity' => 5,
                'basePower' => 560,
                'baseLife' => 3000,
                'baseSpeed' => 100,
                'baseEvasion' => 9,
                'specialSkillName' => 'ゴルーチンラッシュ',
                'specialSkillDescription' => '自身の攻撃力の2倍分のダメージ相手キャラ全員に与える',
                'specialSkillTurn' => 14,
                'imageUrl' => '/character/go.webp',
            ],
            // html
            [
                'name' => 'html',
                'type' => '言語',
                'rarity' => 5,
                'basePower' => 300,
                'baseLife' => 5000,
                'baseSpeed' => 100,
                'baseEvasion' => 2,
                'specialSkillName' => 'セマンティックHTML',
                'specialSkillDescription' => '味方全員の回避率に30%をプラスする',
                'specialSkillTurn' => 10,
                'imageUrl' => '/character/html.webp',
            ],
            // Javascript
            [
                'name' => 'Javascript',
                'type' => '言語',
                'rarity' => 4,
                'basePower' => 600,
                'baseLife' => 2600,
                'baseSpeed' => 230,
                'baseEvasion' => 8,
                'specialSkillName' => 'LiveScript',
                'specialSkillDescription' => '敵全員の次ターンをスキップする',
                'specialSkillTurn' => 10,
                'imageUrl' => '/character/javascript.webp',
            ],
            // PHP
            [
                'name' => 'PHP',
                'type' => '言語',
                'rarity' => 3,
                'basePower' => 200,
                'baseLife' => 4000,
                'baseSpeed' => 60,
                'baseEvasion' => 10,
                'specialSkillName' => null,
                'specialSkillDescription' => null,
                'specialSkillTurn' => 0,
                'imageUrl' => '/character/php.webp',
            ],
            // Ruby
            [
                'name' => 'Ruby',
                'type' => '言語',
                'rarity' => 5,
                'basePower' => 230,
                'baseLife' => 3000,
                'baseSpeed' => 100,
                'baseEvasion' => 2,
                'specialSkillName' => null,
                'specialSkillDescription' => null,
                'specialSkillTurn' => 0,
                'imageUrl' => '/character/ruby.webp',
            ],
            // Swift
            [
                'name' => 'Swift',
                'type' => '言語',
                'rarity' => 4,
                'basePower' => 800,
                'baseLife' => 3000,
                'baseSpeed' => 100,
                'baseEvasion' => 20,
                'specialSkillName' => null,
                'specialSkillDescription' => null,
                'specialSkillTurn' => 0,
                'imageUrl' => '/character/swift.webp',
            ],
            // Typescript
            [
                'name' => 'Typescript',
                'type' => '言語',
                'rarity' => 4,
                'basePower' => 1000,
                'baseLife' => 2300,
                'baseSpeed' => 30,
                'baseEvasion' => 10,
                'specialSkillName' => null,
                'specialSkillDescription' => null,
                'specialSkillTurn' => 0,
                'imageUrl' => '/character/typescript.webp',
            ],

            // フレームワーク (Framework)
            // Angular
            [
                'name' => 'Angular',
                'type' => 'フレームワーク',
                'rarity' => 4,
                'basePower' => 200,
                'baseLife' => 2200,
                'baseSpeed' => 20,
                'baseEvasion' => 0,
                'specialSkillName' => '依存性の注入',
                'specialSkillDescription' => '味方全員の最大体力25%分を回復する',
                'specialSkillTurn' => 14,
                'imageUrl' => '/character/angular.webp',
            ],
            // React
            [
                'name' => 'React',
                'type' => 'フレームワーク',
                'rarity' => 6,
                'basePower' => 630,
                'baseLife' => 2800,
                'baseSpeed' => 100,
                'baseEvasion' => 10,
                'specialSkillName' => null,
                'specialSkillDescription' => null,
                'specialSkillTurn' => 0,
                'imageUrl' => '/character/react.webp',
            ],
            // Vue
            [
                'name' => 'Vue',
                'type' => 'フレームワーク',
                'rarity' => 4,
                'basePower' => 1000,
                'baseLife' => 2000,
                'baseSpeed' => 140,
                'baseEvasion' => 5,
                'specialSkillName' => null,
                'specialSkillDescription' => null,
                'specialSkillTurn' => 0,
                'imageUrl' => '/character/vue.webp',
            ],
            // Ruby on Rails
            [
                'name' => 'Ruby on Rails',
                'type' => 'フレームワーク',
                'rarity' => 5,
                'basePower' => 400,
                'baseLife' => 2000,
                'baseSpeed' => 90,
                'baseEvasion' => 6,
                // 'specialSkillName' => 'Eloquentストライク',
                'specialSkillName' => null,
                'specialSkillDescription' => null,
                'specialSkillTurn' => 10,
                'imageUrl' => '/character/rubyonrails.webp',
            ],

            // クラウド (Cloud)
            // AWS
            [
                'name' => 'AWS',
                'type' => 'クラウド',
                'rarity' => 5,
                'basePower' => 400,
                'baseLife' => 3000,
                'baseSpeed' => 90,
                'baseEvasion' => 6,
                'specialSkillName' => null,
                'specialSkillDescription' => null,
                'specialSkillTurn' => 0,
                'imageUrl' => '/character/aws.webp',
            ],
            // Azure
            [
                'name' => 'Azure',
                'type' => 'クラウド',
                'rarity' => 5,
                'basePower' => 780,
                'baseLife' => 2100,
                'baseSpeed' => 90,
                'baseEvasion' => 6,
                'specialSkillName' => null,
                'specialSkillDescription' => null,
                'specialSkillTurn' => 0,
                'imageUrl' => '/character/azure.webp',
            ],
            // Google Cloud
            [
                'name' => 'Google Cloud',
                'type' => 'クラウド',
                'rarity' => 5,
                'basePower' => 620,
                'baseLife' => 2200,
                'baseSpeed' => 130,
                'baseEvasion' => 8,
                'specialSkillName' => null,
                'specialSkillDescription' => null,
                'specialSkillTurn' => 0,
                'imageUrl' => '/character/googlecloud.webp',
            ],

            // コンテナー (Container)
            // Docker
            [
                'name' => 'Docker',
                'type' => 'コンテナー',
                'rarity' => 5,
                'basePower' => 300,
                'baseLife' => 4000,
                'baseSpeed' => 70,
                'baseEvasion' => 1,
                'specialSkillName' => 'docker compose up',
                'specialSkillDescription' => '味方全員の体力を50%回復',
                'specialSkillTurn' => 20,
                'imageUrl' => '/character/docker.webp',
            ],

            // オペレーティングシステム (Operating System)
            // Linux
            [
                'name' => 'Linux',
                'type' => 'オペレーティングシステム',
                'rarity' => 4,
                'basePower' => 100,
                'baseLife' => 5000,
                'baseSpeed' => 10,
                'baseEvasion' => 1,
                'specialSkillName' => 'rm -rf /',
                'specialSkillDescription' => null,
                'specialSkillTurn' => 40,
                'imageUrl' => '/character/linux.webp',
            ],
            // Mac
            [
                'name' => 'Mac',
                'type' => 'オペレーティングシステム',
                'rarity' => 3,
                'basePower' => 600,
                'baseLife' => 1600,
                'baseSpeed' => 700,
                'baseEvasion' => 1,
                'specialSkillName' => null,
                'specialSkillDescription' => null,
                'specialSkillTurn' => 0,
                'imageUrl' => '/character/mac.webp',
            ],
            // windows
            [
                'name' => 'windows',
                'type' => 'オペレーティングシステム',
                'rarity' => 3,
                'basePower' => 700,
                'baseLife' => 2600,
                'baseSpeed' => 60,
                'baseEvasion' => 4,
                'specialSkillName' => 'IEを削除',
                'specialSkillDescription' => '味方全員の体力を40%回復',
                'specialSkillTurn' => 5,
                'imageUrl' => '/character/windows.webp',
            ],

            // データベース (Database)
            // Mysql
            [
                'name' => 'Mysql',
                'type' => 'データベース',
                'rarity' => 2,
                'basePower' => 100,
                'baseLife' => 3000,
                'baseSpeed' => 100,
                'baseEvasion' => 15,
                'specialSkillName' => 'SQLインジェクション',
                'specialSkillDescription' => '敵全員の攻撃力とスピードを入れ替える',
                'specialSkillTurn' => 20,
                'imageUrl' => '/character/mysql.webp',
            ],
            // Postgres
            [
                'name' => 'Postgres',
                'type' => 'データベース',
                'rarity' => 3,
                'basePower' => 320,
                'baseLife' => 3400,
                'baseSpeed' => 10,
                'baseEvasion' => 1,
                'specialSkillName' => 'SQLインジェクション',
                'specialSkillDescription' => '敵全員の攻撃力とスピードを入れ替える',
                'specialSkillTurn' => 20,
                'imageUrl' => '/character/postgresql.webp',
            ],
            // Supabase
            [
                'name' => 'Supabase',
                'type' => 'データベース',
                'rarity' => 4,
                'basePower' => 900,
                'baseLife' => 1900,
                'baseSpeed' => 600,
                'baseEvasion' => 20,
                'specialSkillName' => null,
                'specialSkillDescription' => null,
                'specialSkillTurn' => 0,
                'imageUrl' => '/character/supabase.webp',
            ],

            // ゲームエンジン (Game Engine)
            // Unity
            [
                'name' => 'Unity',
                'type' => 'ゲームエンジン',
                'rarity' => 5,
                'basePower' => 620,
                'baseLife' => 2000,
                'baseSpeed' => 250,
                'baseEvasion' => 20,
                'specialSkillName' => '物理エンジン操作',
                'specialSkillDescription' => '敵全員のスピードが90%ダウン',
                'specialSkillTurn' => 12,
                'imageUrl' => '/character/unity.webp',
            ],
        ];
        // $characterList = [
        //     [
        //         'name' => 'git',
        //         'type' => 'バージョン管理',
        //         'rarity' => 2,
        //         'basePower' => 300,
        //         'baseLife' => 1000,
        //         'baseSpeed' => 80,
        //         'baseEvasion' => 5,
        //         'specialSkillName' => 'single_boost_life', // 味方単体の最大HPアップ
        //         'specialSkillTurn' => 3,
        //         'imageUrl' => '/character/git.webp',
        //     ],
        //     [
        //         'name' => 'github',
        //         'type' => 'バージョン管理',
        //         'rarity' => 4,
        //         'basePower' => 900,
        //         'baseLife' => 2000,
        //         'baseSpeed' => 110,
        //         'baseEvasion' => 7,
        //         'specialSkillName' => 'area_boost_evasion', // 味方全体の回避率アップ
        //         'specialSkillTurn' => 5,
        //         'imageUrl' => '/character/github.webp',
        //     ],
        //     [
        //         'name' => 'gitlab',
        //         'type' => 'バージョン管理',
        //         'rarity' => 3,
        //         'basePower' => 700,
        //         'baseLife' => 1000,
        //         'baseSpeed' => 75,
        //         'baseEvasion' => 5,
        //         'specialSkillName' => 'single_stun', // 敵単体をスタン
        //         'specialSkillTurn' => 4,
        //         'imageUrl' => '/character/gitlab.webp',
        //     ],






        // ];

        foreach ($characterList as $character) {
            Character::create($character);
        }
    }
}

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
                'base_power' => 1000, // 1000のまま（100単位）
                'base_life' => 2000,
                'base_speed' => 80,
                'base_evasion' => 7,
                'activeSkillId' => 'skill_uuid1',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/ruby.webp',
            ],
            [
                'name' => 'PHP',
                'type' => '言語',
                'rarity' => 3,
                'base_power' => 600, // 600のまま（100単位）
                'base_life' => 1000, // 400 -> 1000（1000単位）
                'base_speed' => 60,
                'base_evasion' => 4,
                'activeSkillId' => 'skill_uuid2',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/php.webp',
            ],
            [
                'name' => 'Swift',
                'type' => '言語',
                'rarity' => 4,
                'base_power' => 800, // 800のまま（100単位）
                'base_life' => 1000, // 300 -> 1000（1000単位）
                'base_speed' => 70,
                'base_evasion' => 6,
                'activeSkillId' => 'skill_uuid3',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/swift.webp',
            ],
            [
                'name' => 'CSS',
                'type' => '言語',
                'rarity' => 1,
                'base_power' => 100, // 80 -> 100（100単位）
                'base_life' => 1000, // 30 -> 1000（1000単位）
                'base_speed' => 10,
                'base_evasion' => 2,
                'activeSkillId' => null,
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/css.webp',
            ],
            [
                'name' => 'Go',
                'type' => '言語',
                'rarity' => 6,
                'base_power' => 1800, // 1800のまま（100単位）
                'base_life' => 2000, // 310 -> 2000（1000単位）
                'base_speed' => 100,
                'base_evasion' => 9,
                'activeSkillId' => 'skill_uuid5',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/go.webp',
            ],
            [
                'name' => 'html',
                'type' => '言語',
                'rarity' => 5,
                'base_power' => 300, // 280 -> 300（100単位）
                'base_life' => 1000, // 110 -> 1000（1000単位）
                'base_speed' => 100,
                'base_evasion' => 8,
                'activeSkillId' => 'skill_uuid6',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/html.webp',
            ],
            [
                'name' => 'node.js',
                'type' => '実行環境',
                'rarity' => 6,
                'base_power' => 3100, // 3080 -> 3100（100単位）
                'base_life' => 4000, // 110 -> 4000（1000単位）
                'base_speed' => 100,
                'base_evasion' => 9,
                'activeSkillId' => 'skill_uuid7',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/nodejs.webp',
            ],
            [
                'name' => 'react',
                'type' => 'フレームワーク',
                'rarity' => 2,
                'base_power' => 1100, // 1080 -> 1100（100単位）
                'base_life' => 2000, // 100 -> 2000（1000単位）
                'base_speed' => 200,
                'base_evasion' => 10,
                'activeSkillId' => 'skill_uuid8',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/react.webp',
            ],
            [
                'name' => 'rust',
                'type' => '言語',
                'rarity' => 3,
                'base_power' => 1100, // 1080 -> 1100（100単位）
                'base_life' => 2000, // 100 -> 2000（1000単位）
                'base_speed' => 150,
                'base_evasion' => 8,
                'activeSkillId' => 'skill_uuid9',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/rust.webp',
            ],
            [
                'name' => 'angular',
                'type' => 'フレームワーク',
                'rarity' => 4,
                'base_power' => 1000, // 950 -> 1000（100単位）
                'base_life' => 2000, // 200 -> 2000（1000単位）
                'base_speed' => 120,
                'base_evasion' => 7,
                'activeSkillId' => 'skill_uuid10',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/angular.webp',
            ],
            [
                'name' => 'aws',
                'type' => 'クラウド',
                'rarity' => 5,
                'base_power' => 2000, // 2000のまま（100単位）
                'base_life' => 3000, // 300 -> 3000（1000単位）
                'base_speed' => 90,
                'base_evasion' => 6,
                'activeSkillId' => 'skill_uuid11',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/aws.webp',
            ],
            [
                'name' => 'docker',
                'type' => 'コンテナー',
                'rarity' => 4,
                'base_power' => 700, // 700のまま（100単位）
                'base_life' => 1000, // 250 -> 1000（1000単位）
                'base_speed' => 60,
                'base_evasion' => 5,
                'activeSkillId' => 'skill_uuid12',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/docker.webp',
            ],
            [
                'name' => 'mysql',
                'type' => 'データベース',
                'rarity' => 2,
                'base_power' => 600, // 550 -> 600（100単位）
                'base_life' => 1000, // 350 -> 1000（1000単位）
                'base_speed' => 50,
                'base_evasion' => 3,
                'activeSkillId' => 'skill_uuid13',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/mysql.webp',
            ],
            [
                'name' => 'azure',
                'type' => 'クラウド',
                'rarity' => 5,
                'base_power' => 1500, // 1500のまま（100単位）
                'base_life' => 2000, // 400 -> 2000（1000単位）
                'base_speed' => 90,
                'base_evasion' => 6,
                'activeSkillId' => 'skill_uuid14',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/azure.webp',
            ],
            [
                'name' => 'gcp',
                'type' => 'クラウド',
                'rarity' => 5,
                'base_power' => 1000, // 1000のまま（100単位）
                'base_life' => 2000, // 200 -> 2000（1000単位）
                'base_speed' => 130,
                'base_evasion' => 8,
                'activeSkillId' => 'skill_uuid15',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/gcp.webp',
            ],
            [
                'name' => 'git',
                'type' => 'バージョン管理',
                'rarity' => 2,
                'base_power' => 300, // 300のまま（100単位）
                'base_life' => 1000, // 150 -> 1000（1000単位）
                'base_speed' => 80,
                'base_evasion' => 5,
                'activeSkillId' => 'skill_uuid16',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/git.webp',
            ],
            [
                'name' => 'github',
                'type' => 'バージョン管理',
                'rarity' => 4,
                'base_power' => 900, // 900のまま（100単位）
                'base_life' => 2000, // 400 -> 2000（1000単位）
                'base_speed' => 110,
                'base_evasion' => 7,
                'activeSkillId' => 'skill_uuid17',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/github.webp',
            ],
            [
                'name' => 'gitlab',
                'type' => 'バージョン管理',
                'rarity' => 3,
                'base_power' => 700, // 650 -> 700（100単位）
                'base_life' => 1000, // 170 -> 1000（1000単位）
                'base_speed' => 75,
                'base_evasion' => 5,
                'activeSkillId' => 'skill_uuid18',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/gitlab.webp',
            ],
            [
                'name' => 'javascript',
                'type' => '言語',
                'rarity' => 4,
                'base_power' => 1200, // 1200のまま（100単位）
                'base_life' => 2000, // 220 -> 2000（1000単位）
                'base_speed' => 130,
                'base_evasion' => 8,
                'activeSkillId' => 'skill_uuid19',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/javascript.webp',
            ],
            [
                'name' => 'postgresql',
                'type' => 'データベース',
                'rarity' => 3,
                'base_power' => 700, // 700のまま（100単位）
                'base_life' => 1000, // 360 -> 1000（1000単位）
                'base_speed' => 65,
                'base_evasion' => 4,
                'activeSkillId' => 'skill_uuid20',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/postgresql.webp',
            ],
            [
                'name' => 'supabase',
                'type' => 'データベース',
                'rarity' => 4,
                'base_power' => 900, // 850 -> 900（100単位）
                'base_life' => 1000, // 280 -> 1000（1000単位）
                'base_speed' => 75,
                'base_evasion' => 5,
                'activeSkillId' => 'skill_uuid21',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/supabase.webp',
            ],
            [
                'name' => 'unity',
                'type' => 'ゲームエンジン',
                'rarity' => 5,
                'base_power' => 1600, // 1600のまま（100単位）
                'base_life' => 2000, // 450 -> 2000（1000単位）
                'base_speed' => 95,
                'base_evasion' => 6,
                'activeSkillId' => 'skill_uuid22',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/unity.webp',
            ],
            [
                'name' => 'vue',
                'type' => 'フレームワーク',
                'rarity' => 4,
                'base_power' => 1100, // 1100のまま（100単位）
                'base_life' => 2000, // 190 -> 2000（1000単位）
                'base_speed' => 140,
                'base_evasion' => 8,
                'activeSkillId' => 'skill_uuid23',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/vue.webp',
            ],
            [
                'name' => 'linux',
                'type' => 'オペレーティングシステム',
                'rarity' => 4,
                'base_power' => 900, // 900のまま（100単位）
                'base_life' => 2000, // 350 -> 2000（1000単位）
                'base_speed' => 85,
                'base_evasion' => 6,
                'activeSkillId' => 'skill_uuid24',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/linux.webp',
            ],
            [
                'name' => 'mac',
                'type' => 'オペレーティングシステム',
                'rarity' => 3,
                'base_power' => 700, // 650 -> 700（100単位）
                'base_life' => 1000, // 200 -> 1000（1000単位）
                'base_speed' => 70,
                'base_evasion' => 5,
                'activeSkillId' => 'skill_uuid25',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/mac.webp',
            ],
            [
                'name' => 'Ruby on Rails',
                'type' => 'フレームワーク',
                'rarity' => 5,
                'base_power' => 1200, // 1200のまま（100単位）
                'base_life' => 2000, // 450 -> 2000（1000単位）
                'base_speed' => 90,
                'base_evasion' => 6,
                'activeSkillId' => 'skill_uuid26',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/rubyonrails.webp',
            ],
            [
                'name' => 'windows',
                'type' => 'オペレーティングシステム',
                'rarity' => 3,
                'base_power' => 700, // 700のまま（100単位）
                'base_life' => 1000, // 300 -> 1000（1000単位）
                'base_speed' => 60,
                'base_evasion' => 4,
                'activeSkillId' => 'skill_uuid27',
                'passiveSkillId' => null,
                'partySkillId' => null,
                'image_url' => '/character/windows.webp',
            ],
        ];

        foreach ($characterList as $character) {
            Character::create($character);
        }
    }
}

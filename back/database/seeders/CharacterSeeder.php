<?php

namespace Database\Seeders;

use App\Models\Character;
use Illuminate\Database\Seeder;

class CharacterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $characters = [
            [
                'name' => 'Ruby',
                'rarity' => 5,
                'base_power' => 1000,
                'base_life' => 500,
                'base_speed' => 80,
                'image_url' => '/character/ruby.webp',
                'skill' => 'Fire Breath',
            ],
            [
                'name' => 'PHP',
                'rarity' => 3,
                'base_power' => 600,
                'base_life' => 400,
                'base_speed' => 60,
                'image_url' => '/character/php.webp',
                'skill' => 'Sword Slash',
            ],
            [
                'name' => 'Swift',
                'rarity' => 4,
                'base_power' => 800,
                'base_life' => 300,
                'base_speed' => 70,
                'image_url' => '/character/swift.webp',
                'skill' => 'Magic Blast',
            ],
            [
                'name' => 'css',
                'rarity' => 1,
                'base_power' => 80,
                'base_life' => 30,
                'base_speed' => 10,
                'image_url' => '/character/css.webp',
                'skill' => 'css Blast',
            ],
            [
                'name' => 'go',
                'rarity' => 6,
                'base_power' => 180,
                'base_life' => 310,
                'base_speed' => 100,
                'image_url' => '/character/go.webp',
                'skill' => 'go Blast',
            ],
            [
                'name' => 'html',
                'rarity' => 5,
                'base_power' => 280,
                'base_life' => 110,
                'base_speed' => 100,
                'image_url' => '/character/html.webp',
                'skill' => 'html Blast',
            ],
            [
                'name' => 'node.js',
                'rarity' => 6,
                'base_power' => 3080,
                'base_life' => 110,
                'base_speed' => 100,
                'image_url' => '/character/nodejs.webp',
                'skill' => 'node.js Blast',
            ],
            [
                'name' => 'react',
                'rarity' => 2,
                'base_power' => 1080,
                'base_life' => 100,
                'base_speed' => 200,
                'image_url' => '/character/react.webp',
                'skill' => 'react Blast',
            ],
            [
                'name' => 'rust',
                'rarity' => 3,
                'base_power' => 1080,
                'base_life' => 100,
                'base_speed' => 150,
                'image_url' => '/character/rust.webp',
                'skill' => 'rust Blast',
            ],
            [
                'name' => 'angular',
                'rarity' => 4,
                'base_power' => 950,
                'base_life' => 200,
                'base_speed' => 120,
                'image_url' => '/character/angular.webp',
                'skill' => 'angular Blast',
            ],
            [
                'name' => 'aws',
                'rarity' => 5,
                'base_power' => 2000,
                'base_life' => 300,
                'base_speed' => 90,
                'image_url' => '/character/aws.webp',
                'skill' => 'aws Cloud Strike',
            ],
            [
                'name' => 'docker',
                'rarity' => 4,
                'base_power' => 700,
                'base_life' => 250,
                'base_speed' => 60,
                'image_url' => '/character/docker.webp',
                'skill' => 'Container Shield',
            ],
            [
                'name' => 'mysql',
                'rarity' => 2,
                'base_power' => 550,
                'base_life' => 350,
                'base_speed' => 50,
                'image_url' => '/character/mysql.webp',
                'skill' => 'SQL Injection',
            ],
            [
                'name' => 'azure',
                'rarity' => 5,
                'base_power' => 1500,
                'base_life' => 400,
                'base_speed' => 90,
                'image_url' => '/character/azure.webp',
                'skill' => 'Azure Blast',
            ],
            [
                'name' => 'gcp',
                'rarity' => 5,
                'base_power' => 1000,
                'base_life' => 200,
                'base_speed' => 130,
                'image_url' => '/character/gcp.webp',
                'skill' => 'Google Cloud Burst',
            ],
            [
                'name' => 'git',
                'rarity' => 2,
                'base_power' => 300,
                'base_life' => 150,
                'base_speed' => 80,
                'image_url' => '/character/git.webp',
                'skill' => 'Commit Strike',
            ],
            [
                'name' => 'github',
                'rarity' => 4,
                'base_power' => 900,
                'base_life' => 400,
                'base_speed' => 110,
                'image_url' => '/character/github.webp',
                'skill' => 'Merge Blast',
            ],
            [
                'name' => 'gitlab',
                'rarity' => 3,
                'base_power' => 650,
                'base_life' => 170,
                'base_speed' => 75,
                'image_url' => '/character/gitlab.webp',
                'skill' => 'Pipeline Blast',
            ],
            [
                'name' => 'javascript',
                'rarity' => 4,
                'base_power' => 1200,
                'base_life' => 220,
                'base_speed' => 130,
                'image_url' => '/character/javascript.webp',
                'skill' => 'Event Loop',
            ],
            [
                'name' => 'postgresql',
                'rarity' => 3,
                'base_power' => 700,
                'base_life' => 360,
                'base_speed' => 65,
                'image_url' => '/character/postgresql.webp',
                'skill' => 'Query Blast',
            ],
            [
                'name' => 'supabase',
                'rarity' => 4,
                'base_power' => 850,
                'base_life' => 280,
                'base_speed' => 75,
                'image_url' => '/character/supabase.webp',
                'skill' => 'Realtime Strike',
            ],
            [
                'name' => 'unity',
                'rarity' => 5,
                'base_power' => 1600,
                'base_life' => 450,
                'base_speed' => 95,
                'image_url' => '/character/unity.webp',
                'skill' => 'Game Engine Blast',
            ],
            [
                'name' => 'vue',
                'rarity' => 4,
                'base_power' => 1100,
                'base_life' => 190,
                'base_speed' => 140,
                'image_url' => '/character/vue.webp',
                'skill' => 'Vue Storm',
            ]
        ];


        foreach ($characters as $characterData) {
            Character::create($characterData);
        }
    }
}

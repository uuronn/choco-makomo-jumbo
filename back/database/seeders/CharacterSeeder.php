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
                'name' => 'python',
                'rarity' => 6,
                'base_power' => 2080,
                'base_life' => 1100,
                'base_speed' => 2000,
                'image_url' => '/character/python.webp',
                'skill' => 'python Blast',
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
                'base_life' => 121,
                'base_speed' => 224,
                'image_url' => '/character/rust.webp',
                'skill' => 'rust Blast',
            ],
        ];

        foreach ($characters as $characterData) {
            Character::create($characterData);
        }
    }
}

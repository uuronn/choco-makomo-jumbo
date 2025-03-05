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
                'image_url' => '/character/ruby.png',
                'skill' => 'Fire Breath',
            ],
            [
                'name' => 'PHP',
                'rarity' => 3,
                'base_power' => 600,
                'base_life' => 400,
                'base_speed' => 60,
                'image_url' => '/character/php.png',
                'skill' => 'Sword Slash',
            ],
            [
                'name' => 'Swift',
                'rarity' => 4,
                'base_power' => 800,
                'base_life' => 300,
                'base_speed' => 70,
                'image_url' => '/character/swift.png',
                'skill' => 'Magic Blast',
            ],
        ];

        foreach ($characters as $characterData) {
            Character::create($characterData);
        }
    }
}

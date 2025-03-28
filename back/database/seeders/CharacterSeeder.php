<?php

namespace Database\Seeders;

use App\Model\Character;
use Illuminate\Database\Seeder;

class CharacterSeeder extends Seeder
{
    public function run(): void
    {
        $characters = require_once __DIR__ . '/data/characters.php';

        foreach ($characters as $character) {
            Character::create($character);
        }
    }
}

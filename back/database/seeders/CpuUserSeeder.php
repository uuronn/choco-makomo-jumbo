<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Model\User;

class CpuUserSeeder extends Seeder
{
    public function run()
    {
        User::updateOrCreate(
            ['id' => '00000000-0000-0000-0000-000000000cpu'],
            [
                'name' => 'CPU',
                'email' => 'cpu@example.com', // not nullの場合
                'photoUrl' => '/images/cpu.png',
                'point' => 0,
                'last_activity_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }
}

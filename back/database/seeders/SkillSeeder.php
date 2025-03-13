<?php

namespace Database\Seeders;

use App\Shared\Model\Skill;
use Illuminate\Database\Seeder;

class SkillSeeder extends Seeder
{
    public function run(): void
    {
        $skills = [
            ['id' => 'skill_uuid1', 'name' => 'Fire Blast', 'effect_type' => 'attack', 'effect_amount' => 50],
            ['id' => 'skill_uuid2', 'name' => 'Quick Slash', 'effect_type' => 'attack', 'effect_amount' => 30],
            ['id' => 'skill_uuid3', 'name' => 'Swift Strike', 'effect_type' => 'attack', 'effect_amount' => 40],
            ['id' => 'skill_uuid4', 'name' => 'Weak Jab', 'effect_type' => 'attack', 'effect_amount' => 10],
            ['id' => 'skill_uuid5', 'name' => 'Thunder Bolt', 'effect_type' => 'attack', 'effect_amount' => 60],
            ['id' => 'skill_uuid6', 'name' => 'Hyper Beam', 'effect_type' => 'attack', 'effect_amount' => 80],
            ['id' => 'skill_uuid7', 'name' => 'Mega Punch', 'effect_type' => 'attack', 'effect_amount' => 70],
            ['id' => 'skill_uuid8', 'name' => 'React Burst', 'effect_type' => 'attack', 'effect_amount' => 45],
            ['id' => 'skill_uuid9', 'name' => 'Rust Shield', 'effect_type' => 'defense', 'effect_amount' => 20],
            ['id' => 'skill_uuid10', 'name' => 'Angle Slash', 'effect_type' => 'attack', 'effect_amount' => 35],
            ['id' => 'skill_uuid11', 'name' => 'Cloud Strike', 'effect_type' => 'attack', 'effect_amount' => 55],
            ['id' => 'skill_uuid12', 'name' => 'Container Bash', 'effect_type' => 'attack', 'effect_amount' => 25],
            ['id' => 'skill_uuid13', 'name' => 'Query Boost', 'effect_type' => 'support', 'effect_amount' => 15],
            ['id' => 'skill_uuid14', 'name' => 'Azure Wave', 'effect_type' => 'attack', 'effect_amount' => 50],
            ['id' => 'skill_uuid15', 'name' => 'Compute Blast', 'effect_type' => 'attack', 'effect_amount' => 40],
            ['id' => 'skill_uuid16', 'name' => 'Commit Push', 'effect_type' => 'support', 'effect_amount' => 10],
            ['id' => 'skill_uuid17', 'name' => 'Repo Sync', 'effect_type' => 'support', 'effect_amount' => 20],
            ['id' => 'skill_uuid18', 'name' => 'Pipeline Rush', 'effect_type' => 'attack', 'effect_amount' => 30],
            ['id' => 'skill_uuid19', 'name' => 'Script Frenzy', 'effect_type' => 'attack', 'effect_amount' => 45],
            ['id' => 'skill_uuid20', 'name' => 'Query Storm', 'effect_type' => 'attack', 'effect_amount' => 35],
            ['id' => 'skill_uuid21', 'name' => 'Base Boost', 'effect_type' => 'support', 'effect_amount' => 25],
            ['id' => 'skill_uuid22', 'name' => 'Unity Blast', 'effect_type' => 'attack', 'effect_amount' => 60],
            ['id' => 'skill_uuid23', 'name' => 'View Pulse', 'effect_type' => 'attack', 'effect_amount' => 40],
            ['id' => 'skill_uuid24', 'name' => 'Kernel Strike', 'effect_type' => 'attack', 'effect_amount' => 35],
            ['id' => 'skill_uuid25', 'name' => 'Apple Slash', 'effect_type' => 'attack', 'effect_amount' => 30],
            ['id' => 'skill_uuid26', 'name' => 'Rail Gun', 'effect_type' => 'attack', 'effect_amount' => 50],
            ['id' => 'skill_uuid27', 'name' => 'Window Smash', 'effect_type' => 'attack', 'effect_amount' => 25],
        ];

        foreach ($skills as $skill) {
            Skill::create($skill);
        }
    }
}

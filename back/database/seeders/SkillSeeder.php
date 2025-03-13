<?php

namespace Database\Seeders;

use App\Model\Skill;
use Illuminate\Database\Seeder;

class SkillSeeder extends Seeder
{
    public function run(): void
    {
        $skills = [
            ['id' => 'skill_uuid1', 'name' => 'Fire Blast', 'effect_type' => 'attack', 'effect_amount' => 50, 'description' => '強力な火炎を放つ攻撃'],
            ['id' => 'skill_uuid2', 'name' => 'Quick Slash', 'effect_type' => 'attack', 'effect_amount' => 30, 'description' => '素早い斬撃で敵を切り裂く'],
            ['id' => 'skill_uuid3', 'name' => 'Swift Strike', 'effect_type' => 'attack', 'effect_amount' => 40, 'description' => '迅速かつ鋭い一撃を放つ'],
            ['id' => 'skill_uuid4', 'name' => 'Weak Jab', 'effect_type' => 'attack', 'effect_amount' => 10, 'description' => '弱いが素早い突き攻撃'],
            ['id' => 'skill_uuid5', 'name' => 'Thunder Bolt', 'effect_type' => 'attack', 'effect_amount' => 60, 'description' => '雷を落として敵を攻撃'],
            ['id' => 'skill_uuid6', 'name' => 'Hyper Beam', 'effect_type' => 'attack', 'effect_amount' => 80, 'description' => '超強力なエネルギービーム'],
            ['id' => 'skill_uuid7', 'name' => 'Mega Punch', 'effect_type' => 'attack', 'effect_amount' => 70, 'description' => '巨大な拳で敵を殴る'],
            ['id' => 'skill_uuid8', 'name' => 'React Burst', 'effect_type' => 'attack', 'effect_amount' => 45, 'description' => '反応速度を活かした爆発攻撃'],
            ['id' => 'skill_uuid9', 'name' => 'Rust Shield', 'effect_type' => 'defense', 'effect_amount' => 20, 'description' => '錆びた盾で防御力を上げる'],
            ['id' => 'skill_uuid10', 'name' => 'Angle Slash', 'effect_type' => 'attack', 'effect_amount' => 35, 'description' => '角度を計算した精密な斬撃'],
            ['id' => 'skill_uuid11', 'name' => 'Cloud Strike', 'effect_type' => 'attack', 'effect_amount' => 55, 'description' => '雲を切り裂くような強力な一撃'],
            ['id' => 'skill_uuid12', 'name' => 'Container Bash', 'effect_type' => 'attack', 'effect_amount' => 25, 'description' => 'コンテナを叩きつける攻撃'],
            ['id' => 'skill_uuid13', 'name' => 'Query Boost', 'effect_type' => 'support', 'effect_amount' => 15, 'description' => 'クエリ速度を向上させる支援'],
            ['id' => 'skill_uuid14', 'name' => 'Azure Wave', 'effect_type' => 'attack', 'effect_amount' => 50, 'description' => '青い波動で敵を押し流す'],
            ['id' => 'skill_uuid15', 'name' => 'Compute Blast', 'effect_type' => 'attack', 'effect_amount' => 40, 'description' => '計算力を爆発に変えた攻撃'],
            ['id' => 'skill_uuid16', 'name' => 'Commit Push', 'effect_type' => 'support', 'effect_amount' => 10, 'description' => 'コードを素早くコミットする支援'],
            ['id' => 'skill_uuid17', 'name' => 'Repo Sync', 'effect_type' => 'support', 'effect_amount' => 20, 'description' => 'リポジトリを同期して強化'],
            ['id' => 'skill_uuid18', 'name' => 'Pipeline Rush', 'effect_type' => 'attack', 'effect_amount' => 30, 'description' => 'パイプラインを突進する攻撃'],
            ['id' => 'skill_uuid19', 'name' => 'Script Frenzy', 'effect_type' => 'attack', 'effect_amount' => 45, 'description' => 'スクリプトを狂乱的に実行'],
            ['id' => 'skill_uuid20', 'name' => 'Query Storm', 'effect_type' => 'attack', 'effect_amount' => 35, 'description' => 'クエリの嵐で敵を圧倒'],
            ['id' => 'skill_uuid21', 'name' => 'Base Boost', 'effect_type' => 'support', 'effect_amount' => 25, 'description' => '基盤を強化する支援スキル'],
            ['id' => 'skill_uuid22', 'name' => 'Unity Blast', 'effect_type' => 'attack', 'effect_amount' => 60, 'description' => '団結の力を爆発させる'],
            ['id' => 'skill_uuid23', 'name' => 'View Pulse', 'effect_type' => 'attack', 'effect_amount' => 40, 'description' => 'ビューを波動に変えた攻撃'],
            ['id' => 'skill_uuid24', 'name' => 'Kernel Strike', 'effect_type' => 'attack', 'effect_amount' => 35, 'description' => 'カーネルを叩きつける一撃'],
            ['id' => 'skill_uuid25', 'name' => 'Apple Slash', 'effect_type' => 'attack', 'effect_amount' => 30, 'description' => 'リンゴを切り裂くような斬撃'],
            ['id' => 'skill_uuid26', 'name' => 'Rail Gun', 'effect_type' => 'attack', 'effect_amount' => 50, 'description' => 'レールガンで敵を貫く'],
            ['id' => 'skill_uuid27', 'name' => 'Window Smash', 'effect_type' => 'attack', 'effect_amount' => 25, 'description' => '窓を粉砕する攻撃'],
        ];

        foreach ($skills as $skill) {
            Skill::create($skill);
        }
    }
}

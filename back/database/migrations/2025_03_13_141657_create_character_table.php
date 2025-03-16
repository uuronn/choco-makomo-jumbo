<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('character', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('type');
            $table->smallInteger('rarity');
            $table->smallInteger('base_power');
            $table->smallInteger('base_life');
            $table->smallInteger('base_speed');
            $table->smallInteger('base_evasion');
            $table->uuid('activeSkillId')->nullable();
            $table->uuid('passiveSkillId')->nullable();
            $table->uuid('partySkillId')->nullable();
            $table->string('image_url');
            $table->timestamps();

            // 外部キー制約
            $table->foreign('activeSkillId')->references('id')->on('skill')->onDelete('set null');
            $table->foreign('passiveSkillId')->references('id')->on('skill')->onDelete('set null');
            $table->foreign('partySkillId')->references('id')->on('skill')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('character');
    }
};

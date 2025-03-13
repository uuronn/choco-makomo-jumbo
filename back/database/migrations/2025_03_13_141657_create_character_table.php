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
            $table->bigInteger('base_power');
            $table->bigInteger('base_life');
            $table->bigInteger('base_speed');
            $table->uuid('active_skill_id')->nullable();
            $table->uuid('passive_skill_id')->nullable();
            $table->uuid('party_skill_id')->nullable();
            $table->string('image_url');
            $table->timestamps();

            // 外部キー制約
            // $table->foreign('active_skill_id')->references('id')->on('skill')->onDelete('set null');
            // $table->foreign('passive_skill_id')->references('id')->on('skill')->onDelete('set null');
            // $table->foreign('party_skill_id')->references('id')->on('skill')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('character');
    }
};

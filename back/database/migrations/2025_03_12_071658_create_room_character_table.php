<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('roomCharacter', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('roomId')->index();
            $table->uuid('characterId');
            $table->uuid('userId');
            $table->smallInteger('level')->unsigned();
            $table->smallInteger('maxLife')->unsigned();
            $table->smallInteger('life')->unsigned();
            $table->smallInteger('power')->unsigned();
            $table->smallInteger('speed')->unsigned();
            $table->tinyInteger('evasion')->unsigned();
            $table->boolean('isActive')->default(true);
            $table->boolean('isDead')->default(false);
            $table->tinyInteger('blockCount')->unsigned()->default(0);
            $table->tinyInteger('confusionCount')->unsigned()->default(0);
            $table->tinyInteger('poisonCount')->unsigned()->default(0);
            $table->tinyInteger('specialSkillTurn')->unsigned()->default(0);
            $table->boolean('specialUsed')->default(false);
            $table->boolean('isErrorMode')->default(false);
            $table->timestamps();

            // 外部キー制約
            $table->foreign('roomId')->references('id')->on('room')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roomCharacter');
    }
};

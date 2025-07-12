<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('duoRoomCharacter', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('duoRoomId')->index();
            $table->uuid('characterId')->index();
            $table->uuid('userId')->index();
            $table->smallInteger('level')->unsigned();
            $table->smallInteger('maxLife')->unsigned();
            $table->smallInteger('life')->unsigned();
            $table->smallInteger('power')->unsigned();
            $table->smallInteger('speed')->unsigned();
            $table->tinyInteger('evasion')->unsigned();
            $table->tinyInteger('critical')->unsigned()->default(0);
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
            $table->foreign('duoRoomId')
                  ->references('id')->on('duoRoom')
                  ->onDelete('cascade');
            $table->foreign('characterId')
                  ->references('id')->on('character')
                  ->onDelete('restrict');
            $table->foreign('userId')
                  ->references('id')->on('user')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('duoRoomCharacter');
    }
};

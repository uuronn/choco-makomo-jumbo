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
            $table->uuid('characterId');
            $table->uuid('userId');
            $table->unsignedSmallInteger('level');
            $table->unsignedSmallInteger('maxLife');
            $table->unsignedSmallInteger('life');
            $table->unsignedSmallInteger('power');
            $table->unsignedSmallInteger('speed');
            $table->unsignedTinyInteger('evasion');
            $table->unsignedTinyInteger('critical');
            $table->boolean('isActive')->default(true);
            $table->boolean('isDead')->default(false);
            $table->unsignedTinyInteger('blockCount')->default(0);
            $table->unsignedTinyInteger('confusionCount')->default(0);
            $table->unsignedTinyInteger('poisonCount')->default(0);
            $table->unsignedTinyInteger('specialSkillTurn')->default(0);
            $table->boolean('specialUsed')->default(false);
            $table->boolean('isErrorMode')->default(false);
            $table->timestamps();

            $table->foreign('duoRoomId')->references('id')->on('duoRoom')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('duoRoomCharacter');
    }
};

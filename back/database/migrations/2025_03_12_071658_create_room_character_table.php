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
            $table->smallInteger('level');
            $table->smallInteger('life');
            $table->smallInteger('maxLife');
            $table->smallInteger('power');
            $table->smallInteger('speed');
            $table->smallInteger('evasion');
            $table->boolean('isActive')->default(true);
            $table->boolean('isDead')->default(false);
            $table->smallInteger('specialTurnRequirement')->default(5);
            $table->boolean('specialUsed')->default(false);
            $table->timestamps();

            $table->foreign('roomId')->references('id')->on('room')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roomCharacter');
    }
};

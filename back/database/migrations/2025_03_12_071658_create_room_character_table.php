<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up()
    {
        Schema::create('room_character', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('room_id')->index();
            $table->uuid('character_id');
            $table->smallInteger('level');
            $table->smallInteger('life');
            $table->smallInteger('power');
            $table->smallInteger('speed');
            $table->smallInteger('evasion');
            $table->timestamps();

            $table->foreign('room_id')->references('id')->on('room')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_character');
    }
};

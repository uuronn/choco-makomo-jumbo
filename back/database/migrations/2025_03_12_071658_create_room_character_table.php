<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('room_character', function (Blueprint $table) {
            $table->id();
            $table->uuid('room_id')->index();
            $table->uuid('character_id');
            $table->integer('level');
            $table->integer('life');
            $table->integer('power');
            $table->integer('speed');
            $table->string('skill')->nullable();
            $table->timestamps();

            $table->foreign('room_id')->references('id')->on('rooms')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_character');
    }
};

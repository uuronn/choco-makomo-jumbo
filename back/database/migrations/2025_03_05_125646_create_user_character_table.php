<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_character', function (Blueprint $table) {
            $table->uuid('user_id');
            $table->uuid('character_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('character_id')->references('id')->on('character')->onDelete('cascade');
            $table->integer('level');
            $table->integer('life');
            $table->integer('power');
            $table->integer('speed');
            $table->primary(['user_id', 'character_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_character');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRoomCharacterTable extends Migration
{
    public function up()
    {
        Schema::create('room_character', function (Blueprint $table) {
            $table->id();
            $table->uuid('room_id');
            $table->string('character_id');
            $table->integer('level');
            $table->integer('life');
            $table->integer('power');
            $table->integer('speed');
            $table->string('skill')->nullable();
            $table->timestamps();

            $table->foreign('room_id')->references('id')->on('rooms')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('room_character');
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('roomLog', function (Blueprint $table) {
            $table->id();
            $table->uuid('roomId');
            $table->string('actionType');
            $table->string('actorUserId')->nullable(); // UUID対応
            $table->unsignedBigInteger('actorCharacterId')->nullable();
            $table->string('targetUserId')->nullable(); // UUID対応
            $table->unsignedBigInteger('targetCharacterId')->nullable();
            $table->integer('value')->nullable();
            $table->string('description');
            $table->timestamps();

            $table->foreign('roomId')->references('id')->on('room')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('roomLog');
    }
};

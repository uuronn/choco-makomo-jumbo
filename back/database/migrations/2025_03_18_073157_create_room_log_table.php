<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('roomLog', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('roomId');
            $table->string('actionType', 50);
            $table->bigInteger('actorUserId')->unsigned();
            $table->string('actorCharacterId');
            $table->bigInteger('targetUserId')->unsigned()->nullable();
            $table->string('targetCharacterId')->nullable();
            $table->integer('value')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('roomId')->references('id')->on('room')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('roomLog');
    }
};

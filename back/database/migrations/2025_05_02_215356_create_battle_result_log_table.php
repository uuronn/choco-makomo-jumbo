<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBattleResultLogsTable extends Migration
{
    public function up()
    {
        Schema::create('battle_result_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('roomId');
            $table->uuid('winnerUserId');
            $table->uuid('loserUserId');
            $table->integer('winnerRateChange');
            $table->integer('loserRateChange');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('battle_result_logs');
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teamRoom', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('team1Id')->index();
            $table->uuid('team2Id')->nullable()->index();
            $table->string('status'); // waiting, pending, battling, finish
            $table->uuid('winTeamId')->nullable();
            $table->uuid('currentTurnUserId')->nullable();
            $table->uuid('currentTurnCharacterId')->nullable();
            $table->integer('totalTurns')->default(0);
            $table->timestamps();

            $table->foreign('team1Id')->references('id')->on('team')->onDelete('cascade');
            $table->foreign('team2Id')->references('id')->on('team')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teamRoom');
    }
}; 
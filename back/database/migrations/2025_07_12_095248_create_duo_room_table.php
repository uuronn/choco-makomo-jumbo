<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('duoRoom', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('hostUserId')->index();
            $table->uuid('guestUserId')->nullable()->index();
            $table->string('status'); // waiting, pending, battling, finished
            $table->smallInteger('totalTurns')->unsigned()->default(0);
            $table->uuid('winUserId')->nullable();
            $table->uuid('currentTurnUserId')->nullable();
            $table->uuid('currentTurnCharacterId')->nullable();
            $table->timestamps();

            // 外部キー制約
            $table->foreign('hostUserId')
                  ->references('id')->on('user')
                  ->onDelete('cascade');
            $table->foreign('guestUserId')
                  ->references('id')->on('user')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('duoRoom');
    }
};

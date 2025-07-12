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
            $table->uuid('coHostUserId')->nullable()->index();
            $table->uuid('guestUserId')->nullable()->index();
            $table->uuid('coGuestUserId')->nullable()->index();
            $table->string('status');
            $table->unsignedSmallInteger('totalTurns')->default(0);
            $table->uuid('winUserId')->nullable();
            $table->uuid('currentTurnUserId')->nullable();
            $table->uuid('currentTurnCharacterId')->nullable();
            $table->timestamps();

            $table->foreign('hostUserId')->references('id')->on('user')->onDelete('cascade');
            $table->foreign('coHostUserId')->references('id')->on('user')->onDelete('cascade');
            $table->foreign('guestUserId')->references('id')->on('user')->onDelete('set null');
            $table->foreign('coGuestUserId')->references('id')->on('user')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('duoRoom');
    }
};

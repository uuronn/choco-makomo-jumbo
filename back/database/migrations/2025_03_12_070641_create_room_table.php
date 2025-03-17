<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('hostUserId')->index();
            $table->uuid('guestUserId')->nullable()->index();
            $table->string('currentTurnUserId')->nullable();
            $table->string('winUserId')->nullable();
            $table->string('status'); // ルームの状態（waiting, pending, battling, finished）
            $table->timestamps();

            // 外部キー制約（オプション）
            $table->foreign('hostUserId')->references('id')->on('user')->onDelete('cascade');
            $table->foreign('guestUserId')->references('id')->on('user')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('room', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('host_user_id')->index(); // ホストのユーザーID
            $table->uuid('guest_user_id')->nullable()->index(); // ゲストのユーザーID（対戦相手がいない場合はNULL）
            $table->string('status'); // ルームの状態（waiting, in_progress, finished など）
            $table->timestamps();

            // 外部キー制約（オプション）
            $table->foreign('host_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('guest_user_id')->references('id')->on('users')->onDelete('set null'); // ゲストが抜けたらNULLにする
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room');
    }
};

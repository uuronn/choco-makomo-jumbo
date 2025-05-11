<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('team', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('leaderUserId')->index();
            $table->uuid('memberUserId')->nullable()->index();
            $table->string('status'); // waiting, pending, ready
            $table->timestamps();

            $table->foreign('leaderUserId')->references('id')->on('user')->onDelete('cascade');
            $table->foreign('memberUserId')->references('id')->on('user')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team');
    }
}; 
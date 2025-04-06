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
        Schema::create('reportLog', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('userId');           // ユーザーID（UUID）
            $table->string('type');            // 種別（例: "daily", "weekly" など）
            $table->text('title');
            $table->text('content');

            $table->timestamps();

            $table->foreign('userId')->references('id')->on('user')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reportLog');
    }
};

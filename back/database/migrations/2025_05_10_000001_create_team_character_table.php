<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teamCharacter', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('teamId')->index();
            $table->uuid('userId');
            $table->uuid('characterId');
            $table->timestamps();

            $table->foreign('teamId')->references('id')->on('team')->onDelete('cascade');
            $table->unique(['teamId', 'characterId']); // チーム内でのキャラ重複を防ぐ
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teamCharacter');
    }
}; 
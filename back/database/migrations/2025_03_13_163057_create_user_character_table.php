<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('userCharacter', function (Blueprint $table) {
            $table->uuid('userId');
            $table->uuid('characterId');
            $table->foreign('userId')->references('id')->on('user')->onDelete('cascade');
            $table->foreign('characterId')->references('id')->on('character')->onDelete('cascade');
            $table->smallInteger('level');
            $table->smallInteger('life');
            $table->smallInteger('power');
            $table->smallInteger('speed');
            $table->smallInteger('evasion');
            $table->primary(['userId', 'characterId']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('userCharacter');
    }
};

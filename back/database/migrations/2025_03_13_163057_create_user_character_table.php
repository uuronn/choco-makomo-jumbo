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
            $table->primary(['userId', 'characterId']);
            $table->smallInteger('level')->unsigned();
            $table->smallInteger('life')->unsigned();
            $table->smallInteger('power')->unsigned();
            $table->smallInteger('speed')->unsigned();
            $table->timestamps();

            // 外部キー制約
            $table->foreign('userId')->references('id')->on('user')->onDelete('cascade');
            $table->foreign('characterId')->references('id')->on('character')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('userCharacter');
    }
};

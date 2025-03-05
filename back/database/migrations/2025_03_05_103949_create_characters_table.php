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
        Schema::create('characters', function (Blueprint $table) {
            $table->uuid('id')->primary(); // UUIDを主キーとして定義
            $table->string('name'); // name (text)
            $table->smallInteger('rarity'); // rarity (int2)
            $table->bigInteger('base_power'); // base_power (int8)
            $table->string('image_url'); // image_url (text)
            $table->bigInteger('base_life'); // base_life (int8)
            $table->bigInteger('base_speed'); // base_speed (int8)
            $table->text('skill'); // skill (text)
            $table->timestamps(); // created_at, updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('characters');
    }
};

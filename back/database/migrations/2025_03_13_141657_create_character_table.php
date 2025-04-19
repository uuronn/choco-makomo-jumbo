<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('character', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('officialName')->nullable();
            $table->string('type');
            $table->smallInteger('baseLife')->unsigned();
            $table->smallInteger('basePower')->unsigned();
            $table->smallInteger('baseSpeed')->unsigned();
            $table->tinyInteger('baseEvasion')->unsigned();
            $table->string('partySkillName')->nullable();
            $table->string('partySkillDescription')->nullable();
            $table->string('partySkillCondition')->nullable();
            $table->string('passiveSkillName')->nullable();
            $table->string('passiveSkillDescription')->nullable();
            $table->string('specialSkillName')->nullable();
            $table->string('specialSkillDescription')->nullable();
            $table->tinyInteger('baseSpecialSkillTurn')->unsigned();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('character');
    }
};

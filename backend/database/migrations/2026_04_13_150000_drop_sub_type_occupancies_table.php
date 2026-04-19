<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('sub_type_occupancies');
    }

    public function down(): void
    {
        Schema::create('sub_type_occupancies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_sub_type')->constrained('sub_types')->onDelete('cascade');
            $table->integer('adults')->default(0);
            $table->integer('children_max')->default(0);
            $table->integer('babies_max')->default(0);
            $table->timestamps();
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotel_type_capacities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_hotel')->constrained('hotels')->onDelete('cascade');
            $table->foreignId('id_type')->constrained('types')->onDelete('cascade');
            $table->integer('capacite_adultes')->default(2);
            $table->integer('capacite_enfants')->default(1);
            $table->integer('capacite_seniors')->default(2);
            $table->integer('capacite_bebes')->default(1);
            $table->timestamps();
            $table->unique(['id_hotel', 'id_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotel_type_capacities');
    }
};

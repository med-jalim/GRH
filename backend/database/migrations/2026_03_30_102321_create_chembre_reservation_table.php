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
        Schema::create('chembre_reservation', function (Blueprint $table) {
            $table->timestamps();
            $table->foreignId('id_chembre')->constrained('chembres')->onDelete('cascade');
            $table->foreignId('id_reservation')->constrained('reservations')->onDelete('cascade');
            $table->primary(['id_chembre',"id_reservation"]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chembre_reservation');
    }
};

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
        Schema::create('details_reservation', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->foreignId('id_reservation')->constrained('reservations')->onDelete('cascade');
            $table->foreignId('id_type')->constrained('types')->onDelete('cascade');
            $table->integer('quantite');
            $table->float('prix_unitaire')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('details_reservation');
    }

};

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
        Schema::create('hotel_type_tarification', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_hotel')->constrained('hotels')->onDelete('cascade');
            $table->foreignId('id_type')->constrained('types')->onDelete('cascade');
            $table->boolean('is_essentiel')->default(false);
            // Pourcentage relatif au prix de la chambre essentielle.
            // Ex: 100 = même prix, 200 = double, 150 = +50%, etc.
            $table->float('pourcentage')->default(100);
            $table->timestamps();

            $table->unique(['id_hotel', 'id_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hotel_type_tarification');
    }
};

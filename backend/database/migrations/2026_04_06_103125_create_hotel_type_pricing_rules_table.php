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
        Schema::create('hotel_type_pricing_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_hotel')->constrained('hotels')->cascadeOnDelete();
            $table->foreignId('id_type')->constrained('types')->cascadeOnDelete();
            $table->decimal('percentage', 8, 2)->default(100.00);
            $table->timestamps();

            $table->unique(['id_hotel', 'id_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hotel_type_pricing_rules');
    }
};

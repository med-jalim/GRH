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
        Schema::create('tarifs', function (Blueprint $table) {
            $table->timestamps();
            $table->foreignId('id_type')->constrained('types')->onDelete('cascade');
            $table->foreignId('id_hotel')->constrained('hotels')->onDelete('cascade');
            $table->primary(['id_type',"id_hotel"]);
            $table->float('prix')->default('0');
            $table->date('date_d');
            $table->date('date_f');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tarifs');
    }
};

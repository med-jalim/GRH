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
        Schema::table('hotel_type_capacities', function (Blueprint $table) {
            $table->integer('capacite_totale')->nullable()->after('capacite_bebes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hotel_type_capacities', function (Blueprint $table) {
            $table->dropColumn('capacite_totale');
        });
    }
};

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
            $table->string('label')->nullable()->after('id_type');
            
            // Drop existing unique constraint if it exists
            // The name is usually hotel_type_capacities_id_hotel_id_type_unique
            $table->dropUnique(['id_hotel', 'id_type']);
        });

        Schema::table('tarifs', function (Blueprint $table) {
            $table->foreignId('id_capacity')
                  ->nullable()
                  ->after('id_hotel')
                  ->constrained('hotel_type_capacities')
                  ->onDelete('cascade');

            $table->foreignId('id_type')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tarifs', function (Blueprint $table) {
            $table->dropForeign(['id_capacity']);
            $table->dropColumn('id_capacity');
            $table->foreignId('id_type')->nullable(false)->change();
        });

        Schema::table('hotel_type_capacities', function (Blueprint $table) {
            $table->dropColumn('label');
            $table->unique(['id_hotel', 'id_type']);
        });
    }
};

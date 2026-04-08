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
            if (Schema::hasColumn('hotel_type_capacities', 'capacite_seniors')) {
                $table->dropColumn('capacite_seniors');
            }
        });

        Schema::table('reservation_items', function (Blueprint $table) {
            if (Schema::hasColumn('reservation_items', 'nb_seniors')) {
                $table->dropColumn('nb_seniors');
            }
        });
    }

    public function down(): void
    {
        Schema::table('hotel_type_capacities', function (Blueprint $table) {
            $table->integer('capacite_seniors')->default(2);
        });

        Schema::table('reservation_items', function (Blueprint $table) {
            $table->integer('nb_seniors')->default(0)->after('nb_enfants');
        });
    }
};

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
        Schema::table('hotel_type_tarification', function (Blueprint $table) {
            $table->dropColumn(['pourcentage', 'cap_adultes', 'cap_enfants', 'cap_bebes']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hotel_type_tarification', function (Blueprint $table) {
            $table->float('pourcentage')->default(0);
            $table->integer('cap_adultes')->default(0);
            $table->integer('cap_enfants')->default(0);
            $table->integer('cap_bebes')->default(0);
        });
    }
};

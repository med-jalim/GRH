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
            $table->integer('cap_adultes')->default(2)->after('id_type');
            $table->integer('cap_enfants')->default(0)->after('cap_adultes');
            $table->integer('cap_bebes')->default(0)->after('cap_enfants');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hotel_type_tarification', function (Blueprint $table) {
            $table->dropColumn(['cap_adultes', 'cap_enfants', 'cap_bebes']);
        });
    }
};

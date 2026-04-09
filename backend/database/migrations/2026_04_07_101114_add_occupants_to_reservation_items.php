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
        Schema::table('reservation_items', function (Blueprint $table) {
            $table->integer('nb_adultes')->default(1)->after('quantite');
            $table->integer('nb_enfants')->default(0)->after('nb_adultes');
            $table->integer('nb_bebes')->default(0)->after('nb_enfants');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservation_items', function (Blueprint $table) {
            $table->dropColumn(['nb_adultes', 'nb_enfants', 'nb_bebes']);
        });
    }
};

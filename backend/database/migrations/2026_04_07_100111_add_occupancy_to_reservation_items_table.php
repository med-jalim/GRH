<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservation_items', function (Blueprint $table) {
            $table->integer('nb_adultes')->default(1)->after('prix_unitaire');
            $table->integer('nb_enfants')->default(0)->after('nb_adultes');
            $table->integer('nb_seniors')->default(0)->after('nb_enfants');
            $table->integer('nb_bebes')->default(0)->after('nb_seniors');
        });
    }

    public function down(): void
    {
        Schema::table('reservation_items', function (Blueprint $table) {
            $table->dropColumn(['nb_adultes', 'nb_enfants', 'nb_seniors', 'nb_bebes']);
        });
    }
};

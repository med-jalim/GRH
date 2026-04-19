<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservation_items', function (Blueprint $table) {
            if (Schema::hasColumn('reservation_items', 'nb_bebes')) {
                $table->dropColumn('nb_bebes');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reservation_items', function (Blueprint $table) {
            if (!Schema::hasColumn('reservation_items', 'nb_bebes')) {
                $table->integer('nb_bebes')->default(0)->after('nb_enfants');
            }
        });
    }
};

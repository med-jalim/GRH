<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hotel_type_tarification', function (Blueprint $table) {
            // Note: pourcentage, cap_adultes, cap_enfants, cap_bebes were already
            // removed by the 2026_04_09 cleanup migration.
            // We only need to remove is_essentiel.
            $table->dropColumn('is_essentiel');
        });
    }

    public function down(): void
    {
        Schema::table('hotel_type_tarification', function (Blueprint $table) {
            $table->boolean('is_essentiel')->default(false);
        });
    }
};

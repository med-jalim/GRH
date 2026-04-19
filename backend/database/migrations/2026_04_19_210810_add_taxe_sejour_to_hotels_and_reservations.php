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
        Schema::table('hotels', function (Blueprint $table) {
            $table->decimal('taxe_sejour', 10, 2)->default(0)->after('email');
        });

        Schema::table('reservations', function (Blueprint $table) {
            $table->decimal('taxe_sejour_total', 10, 2)->nullable()->after('prix_total');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hotels', function (Blueprint $table) {
            $table->dropColumn('taxe_sejour');
        });

        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn('taxe_sejour_total');
        });
    }
};

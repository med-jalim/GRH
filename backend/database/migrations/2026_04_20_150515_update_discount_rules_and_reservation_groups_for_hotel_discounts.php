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
        Schema::table('discount_rules', function (Blueprint $table) {
            $table->foreignId('id_hotel')->nullable()->after('id')->constrained('hotels')->onDelete('cascade');
        });

        Schema::table('reservation_groups', function (Blueprint $table) {
            $table->decimal('remise_pourcentage', 5, 2)->nullable()->after('nb_personnes');
            $table->decimal('remise_montant', 15, 2)->nullable()->after('remise_pourcentage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservation_groups', function (Blueprint $table) {
            $table->dropColumn(['remise_pourcentage', 'remise_montant']);
        });

        Schema::table('discount_rules', function (Blueprint $table) {
            $table->dropForeign(['id_hotel']);
            $table->dropColumn('id_hotel');
        });
    }
};

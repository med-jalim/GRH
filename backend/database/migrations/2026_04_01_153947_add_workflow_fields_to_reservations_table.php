<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            if (!Schema::hasColumn('reservations', 'token')) {
                $table->string('token')->nullable()->unique()->after('code_reference');
            }
            if (!Schema::hasColumn('reservations', 'payment_link')) {
                $table->string('payment_link')->nullable()->after('token');
            }
            if (!Schema::hasColumn('reservations', 'paid_amount')) {
                $table->decimal('paid_amount', 12, 2)->default(0)->after('prix_total');
            }
            if (!Schema::hasColumn('reservations', 'total_amount')) {
                $table->decimal('total_amount', 12, 2)->default(0)->after('paid_amount');
            }
        });

        // Update ENUM using raw SQL for compatibility with MySQL/MariaDB
        DB::statement("ALTER TABLE reservations MODIFY COLUMN statut ENUM('en_attente', 'confirme', 'annule', 'en_attente_paiement', 'en_validation', 'valide', 'partiellement_paye') NOT NULL DEFAULT 'en_attente'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['token', 'paid_amount', 'total_amount']);
            // Note: we don't drop payment_link here if it was already there, 
            // but for simplicity of a migration we can just drop it if we added it.
            // However, the enum revert is more important.
        });

        DB::statement("ALTER TABLE reservations MODIFY COLUMN statut ENUM('en_attente', 'confirme', 'annule', 'en_attente_paiement') NOT NULL DEFAULT 'en_attente'");
    }
};

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
        // Update 'statut' ENUM
        DB::statement("ALTER TABLE reservations MODIFY COLUMN statut ENUM('en_attente', 'en_verification', 'valide', 'en_attente_paiement', 'paye_partiellement', 'confirme', 'annule') NOT NULL DEFAULT 'en_attente'");

        // Update 'statut_paiement' ENUM
        DB::statement("ALTER TABLE reservations MODIFY COLUMN statut_paiement ENUM('non_paye', 'paye_partiellement', 'en_attente_verification', 'paye') NOT NULL DEFAULT 'non_paye'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert 'statut'
        DB::statement("ALTER TABLE reservations MODIFY COLUMN statut ENUM('en_attente', 'en_attente_paiement', 'confirme', 'annule') NOT NULL DEFAULT 'en_attente'");

        // Revert 'statut_paiement'
        DB::statement("ALTER TABLE reservations MODIFY COLUMN statut_paiement ENUM('non_paye', 'en_attente_verification', 'paye') NOT NULL DEFAULT 'non_paye'");
    }
};

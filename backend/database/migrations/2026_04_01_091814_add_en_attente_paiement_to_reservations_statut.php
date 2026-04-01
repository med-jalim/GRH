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
        // Using raw SQL to modify ENUM column to be compatible with MySQL
        DB::statement("ALTER TABLE reservations MODIFY COLUMN statut ENUM('en_attente', 'en_attente_paiement', 'confirme', 'annule') NOT NULL DEFAULT 'en_attente'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rollback to the previous state
        DB::statement("ALTER TABLE reservations MODIFY COLUMN statut ENUM('en_attente', 'confirme', 'annule') NOT NULL DEFAULT 'en_attente'");
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            // Link sent by admin to the client for payment
            $table->string('lien_paiement')->nullable()->after('statut');

            // Path to the proof image uploaded by admin (received via email from client)
            $table->string('preuve_paiement')->nullable()->after('lien_paiement');

            // Amount confirmed by admin after viewing the proof
            $table->decimal('montant_paye', 12, 2)->nullable()->after('preuve_paiement');

            // Payment status lifecycle
            $table->enum('statut_paiement', ['non_paye', 'en_attente_verification', 'paye'])
                  ->default('non_paye')
                  ->after('montant_paye');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['lien_paiement', 'preuve_paiement', 'montant_paye', 'statut_paiement']);
        });
    }
};

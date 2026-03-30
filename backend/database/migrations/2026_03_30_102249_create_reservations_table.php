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
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->string('nom_agence');
            $table->string('nom_contact');
            $table->string('code_agence');
            $table->string('email');
            $table->string('telephone');
            $table->foreignId('id_hotel')->constrained('hotels')->onDelete('cascade');
            $table->date('date_arrivee');
            $table->date('date_depart');
            $table->integer('nb_personnes');
            $table->float('prix_total')->default(0);
            $table->text('remarques_speciales')->nullable();
            $table->enum('statut', ['en_attente', 'confirme', 'annule'])->default('en_attente');
            $table->string('code_reference')->unique();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }

};

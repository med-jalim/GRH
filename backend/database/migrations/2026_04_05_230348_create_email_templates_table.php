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
        Schema::create('email_templates', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique(); // e.g., 'reservation_validation'
            $table->string('name');           // e.g., 'Validation Réservation'
            $table->string('subject');        // e.g., 'Confirmation de votre réservation'
            $table->longText('content_html')->nullable();
            $table->longText('content_json')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_templates');
    }
};

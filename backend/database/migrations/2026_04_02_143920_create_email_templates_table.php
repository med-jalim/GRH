<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_templates', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique(); // e.g. 'reservation_status_updated'
            $table->string('name');           // Human-readable name
            $table->string('description')->nullable();

            // Published version (sent to real clients)
            $table->string('published_subject');
            $table->longText('published_content'); // HTML content

            // Draft version (for editing before publishing)
            $table->string('draft_subject')->nullable();
            $table->longText('draft_content')->nullable();

            // Visual settings (color palette, logo, etc.)
            $table->json('settings')->nullable();

            // Available variables hint for the editor
            $table->json('variables')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_templates');
    }
};

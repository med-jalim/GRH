<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('email_templates', function (Blueprint $table) {
            $table->longText('gjs_data')->nullable()->after('settings');
            $table->longText('draft_gjs_data')->nullable()->after('gjs_data');
        });
    }

    public function down(): void
    {
        Schema::table('email_templates', function (Blueprint $table) {
            $table->dropColumn(['gjs_data', 'draft_gjs_data']);
        });
    }
};

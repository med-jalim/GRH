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
            $table->decimal('agency_price_percentage', 8, 2)->default(100)->after('main_type_id');
            $table->decimal('group_price_percentage', 8, 2)->default(120)->after('agency_price_percentage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hotels', function (Blueprint $table) {
            $table->dropColumn(['agency_price_percentage', 'group_price_percentage']);
        });
    }
};

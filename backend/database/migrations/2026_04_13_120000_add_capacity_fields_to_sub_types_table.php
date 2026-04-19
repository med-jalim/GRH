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
        Schema::table('sub_types', function (Blueprint $table) {
            $table->unsignedInteger('max_adults')->default(0)->after('color');
            $table->unsignedInteger('max_children')->default(0)->after('max_adults');
            $table->unsignedInteger('capacity_total')->default(0)->after('max_children');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sub_types', function (Blueprint $table) {
            $table->dropColumn(['max_adults', 'max_children', 'capacity_total']);
        });
    }
};

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
        Schema::table('reservation_groups', function (Blueprint $table) {
            $table->decimal('original_price', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->foreignId('discount_id')->nullable()->constrained('discounts')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservation_groups', function (Blueprint $table) {
            $table->dropForeign(['discount_id']);
            $table->dropColumn(['original_price', 'discount_amount', 'discount_id']);
        });
    }
};

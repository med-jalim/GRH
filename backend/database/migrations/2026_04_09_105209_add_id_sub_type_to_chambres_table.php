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
        Schema::table('chambres', function (Blueprint $table) {
            $table->unsignedBigInteger('id_sub_type')->nullable()->after('id_type');
            $table->foreign('id_sub_type')->references('id')->on('sub_types')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chambres', function (Blueprint $table) {
            $table->dropForeign(['id_sub_type']);
            $table->dropColumn('id_sub_type');
        });
    }
};

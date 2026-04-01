<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // First, ensure all existing values are in a valid JSON array format if they aren't already
        // This is mainly for existing single string paths
        \Illuminate\Support\Facades\DB::table('reservations')
            ->whereNotNull('preuve_paiement')
            ->where('preuve_paiement', 'NOT LIKE', '[\"%') // Basic check for array format
            ->get()
            ->each(function ($res) {
                \Illuminate\Support\Facades\DB::table('reservations')
                    ->where('id', $res->id)
                    ->update(['preuve_paiement' => json_encode([$res->preuve_paiement])]);
            });

        Schema::table('reservations', function (Blueprint $table) {
            $table->json('preuve_paiement')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('preuve_paiement')->nullable()->change();
        });
    }
};

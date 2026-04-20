<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('app_settings')->insert([
            'key' => 'min_rooms_per_reservation',
            'value' => '11',
            'label' => 'Nombre minimum de chambres par réservation',
            'type' => 'number',
            'description' => 'Contrainte de réservation : nombre minimum de chambres requis pour valider une réservation.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('app_settings')->where('key', 'min_rooms_per_reservation')->delete();
    }
};

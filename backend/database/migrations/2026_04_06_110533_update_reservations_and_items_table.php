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
        Schema::table('reservation_items', function (Blueprint $table) {
            $table->date('date_arrivee')->nullable();
            $table->date('date_depart')->nullable();
            $table->integer('nb_personnes')->default(1);
        });

        // Migrate existing data from reservations to reservation_items
        $reservations = \Illuminate\Support\Facades\DB::table('reservations')->get();
        foreach ($reservations as $res) {
            \Illuminate\Support\Facades\DB::table('reservation_items')
                ->where('id_reservation', $res->id)
                ->update([
                    'date_arrivee' => $res->date_arrivee,
                    'date_depart'  => $res->date_depart,
                    'nb_personnes' => $res->nb_personnes,
                ]);
        }

        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['date_arrivee', 'date_depart']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->date('date_arrivee')->nullable();
            $table->date('date_depart')->nullable();
        });

        // Restore data back to reservations from first item found (approximation)
        $items = \Illuminate\Support\Facades\DB::table('reservation_items')->get();
        foreach ($items as $item) {
             \Illuminate\Support\Facades\DB::table('reservations')
                ->where('id', $item->id_reservation)
                ->update([
                    'date_arrivee' => $item->date_arrivee,
                    'date_depart'  => $item->date_depart,
                ]);
        }

        Schema::table('reservation_items', function (Blueprint $table) {
            $table->dropColumn(['date_arrivee', 'date_depart', 'nb_personnes']);
        });
    }
};

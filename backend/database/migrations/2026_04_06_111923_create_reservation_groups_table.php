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
        Schema::create('reservation_groups', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_reservation');
            $table->date('date_arrivee');
            $table->date('date_depart');
            $table->integer('nb_personnes')->default(1);
            $table->timestamps();

            $table->foreign('id_reservation')->references('id')->on('reservations')->onDelete('cascade');
        });

        Schema::table('reservation_items', function (Blueprint $table) {
            $table->unsignedBigInteger('id_group')->nullable()->after('id_reservation');
            $table->foreign('id_group')->references('id')->on('reservation_groups')->onDelete('cascade');
        });

        // Data migration: Create a group for each distinct stay in reservation_items
        $items = \Illuminate\Support\Facades\DB::table('reservation_items')->get();
        foreach ($items as $item) {
            $groupId = \Illuminate\Support\Facades\DB::table('reservation_groups')->insertGetId([
                'id_reservation' => $item->id_reservation,
                'date_arrivee'   => $item->date_arrivee,
                'date_depart'    => $item->date_depart,
                'nb_personnes'   => $item->nb_personnes,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);

            \Illuminate\Support\Facades\DB::table('reservation_items')
                ->where('id', $item->id)
                ->update(['id_group' => $groupId]);
        }

        Schema::table('reservation_items', function (Blueprint $table) {
            $table->unsignedBigInteger('id_group')->nullable(false)->change();
            // We keep id_reservation for now for convenience, or remove it for normalization.
            // Let's remove it and the stay columns.
            $table->dropForeign(['id_reservation']);
            $table->dropColumn(['id_reservation', 'date_arrivee', 'date_depart', 'nb_personnes']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservation_items', function (Blueprint $table) {
            $table->unsignedBigInteger('id_reservation')->nullable();
            $table->date('date_arrivee')->nullable();
            $table->date('date_depart')->nullable();
            $table->integer('nb_personnes')->default(1);
        });

        // Data restoration (approximate: move data back from group)
        $items = \Illuminate\Support\Facades\DB::table('reservation_items')->get();
        foreach ($items as $item) {
            $group = \Illuminate\Support\Facades\DB::table('reservation_groups')->where('id', $item->id_group)->first();
            if ($group) {
                \Illuminate\Support\Facades\DB::table('reservation_items')
                    ->where('id', $item->id)
                    ->update([
                        'id_reservation' => $group->id_reservation,
                        'date_arrivee'   => $group->date_arrivee,
                        'date_depart'    => $group->date_depart,
                        'nb_personnes'   => $group->nb_personnes,
                    ]);
            }
        }

        Schema::table('reservation_items', function (Blueprint $table) {
             $table->dropForeign(['id_group']);
             $table->dropColumn('id_group');
        });

        Schema::dropIfExists('reservation_groups');
    }
};

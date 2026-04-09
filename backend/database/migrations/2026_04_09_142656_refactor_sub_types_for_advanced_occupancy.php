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
        // 1. Add id_hotel to sub_types
        Schema::table('sub_types', function (Blueprint $table) {
            $table->foreignId('id_hotel')->nullable()->after('id_type')->constrained('hotels')->onDelete('cascade');
        });

        // 2. Create sub_type_occupancies table
        Schema::create('sub_type_occupancies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_sub_type')->constrained('sub_types')->onDelete('cascade');
            $table->integer('adults')->default(0);
            $table->integer('children_max')->default(0);
            $table->integer('babies_max')->default(0);
            $table->timestamps();
        });

        // 3. Migrate existing data
        $subTypes = DB::table('sub_types')->get();
        $firstHotel = DB::table('hotels')->first();

        foreach ($subTypes as $st) {
            // Assign to first hotel if it exists to maintain consistency
            if ($firstHotel) {
                DB::table('sub_types')->where('id', $st->id)->update(['id_hotel' => $firstHotel->id]);
            }

            // Move capacities to the new table as the first rule
            DB::table('sub_type_occupancies')->insert([
                'id_sub_type' => $st->id,
                'adults'      => $st->cap_adultes ?? 0,
                'children_max' => $st->cap_enfants ?? 0,
                'babies_max'  => $st->cap_bebes ?? 0,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        // 4. Remove old columns from sub_types
        Schema::table('sub_types', function (Blueprint $table) {
            $table->dropColumn(['cap_adultes', 'cap_enfants', 'cap_bebes']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sub_types', function (Blueprint $table) {
            $table->integer('cap_adultes')->default(0);
            $table->integer('cap_enfants')->default(0);
            $table->integer('cap_bebes')->default(0);
        });

        // Restore data from occupancies back to sub_types (best effort)
        $occupancies = DB::table('sub_type_occupancies')->get();
        foreach ($occupancies as $occ) {
            DB::table('sub_types')->where('id', $occ->id_sub_type)->update([
                'cap_adultes' => $occ->adults,
                'cap_enfants' => $occ->children_max,
                'cap_bebes'   => $occ->babies_max,
            ]);
        }

        Schema::dropIfExists('sub_type_occupancies');

        Schema::table('sub_types', function (Blueprint $table) {
            $table->dropForeign(['id_hotel']);
            $table->dropColumn('id_hotel');
        });
    }
};

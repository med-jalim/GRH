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
        Schema::table('tarifs', function (Blueprint $table) {
            $table->foreignId('id_sub_type')->nullable()->after('id_type')->constrained('sub_types')->onDelete('cascade');
        });

        Schema::table('reservation_items', function (Blueprint $table) {
            $table->foreignId('id_sub_type')->nullable()->after('id_type')->constrained('sub_types')->onDelete('cascade');
        });

        // Data Migration: Create "base" sub-type for each type and link existing data
        $types = \Illuminate\Support\Facades\DB::table('types')->get();
        foreach ($types as $type) {
            $subTypeId = \Illuminate\Support\Facades\DB::table('sub_types')->insertGetId([
                'id_type'      => $type->id,
                'nom'          => 'base',
                'cap_adultes'  => 2,
                'cap_enfants'  => 0,
                'cap_bebes'    => 0,
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);

            \Illuminate\Support\Facades\DB::table('tarifs')
                ->where('id_type', $type->id)
                ->update(['id_sub_type' => $subTypeId]);

            \Illuminate\Support\Facades\DB::table('reservation_items')
                ->where('id_type', $type->id)
                ->update(['id_sub_type' => $subTypeId]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservation_items', function (Blueprint $table) {
            $table->dropForeign(['id_sub_type']);
            $table->dropColumn('id_sub_type');
        });

        Schema::table('tarifs', function (Blueprint $table) {
            $table->dropForeign(['id_sub_type']);
            $table->dropColumn('id_sub_type');
        });
    }
};

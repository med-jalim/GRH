<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->enum('type_reservant', ['agence', 'groupe'])->default('groupe')->after('code_agence');
            $table->float('remise_pourcentage')->nullable()->after('type_reservant');
            $table->float('prix_avant_remise')->nullable()->after('remise_pourcentage');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['type_reservant', 'remise_pourcentage', 'prix_avant_remise']);
        });
    }
};

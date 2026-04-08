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
        Schema::table('payments', function (Blueprint $table) {
            $table->boolean('is_verified')->default(false);
            $table->string('status')->default('pending'); // pending, verified, rejected
            $table->timestamp('verified_at')->nullable();
            $table->unsignedBigInteger('verified_by')->nullable();
            $table->text('notes_admin')->nullable();

            $table->foreign('verified_by')->references('id')->on('users')->onDelete('set null');
        });

        // Set existing payments to verified (assuming they were added by admin)
        DB::table('payments')->update([
            'is_verified' => true,
            'status' => 'verified',
            'verified_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (Schema::hasColumn('payments', 'verified_by')) {
                $table->dropForeign(['verified_by']);
            }
            $table->dropColumn(['is_verified', 'status', 'verified_at', 'verified_by', 'notes_admin']);
        });
    }
};

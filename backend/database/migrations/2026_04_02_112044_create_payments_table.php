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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_reservation')->constrained('reservations')->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->dateTime('payment_date');
            $table->string('proof_path')->nullable();
            $table->string('provenance')->default('admin'); // admin or client
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Data Migration: Move existing proofs from reservations table to payments table
        $reservations = \Illuminate\Support\Facades\DB::table('reservations')
            ->whereNotNull('preuve_paiement')
            ->orWhere('montant_paye', '>', 0)
            ->get();

        foreach ($reservations as $res) {
            $proofs = json_decode($res->preuve_paiement ?? '[]', true);
            $count = count($proofs);
            $totalAmount = (float)($res->montant_paye ?? 0);

            if ($count > 0) {
                $amountPerProof = $totalAmount / $count;
                foreach ($proofs as $path) {
                    \Illuminate\Support\Facades\DB::table('payments')->insert([
                        'id_reservation' => $res->id,
                        'amount'         => $amountPerProof,
                        'payment_date'   => $res->updated_at ?? now(),
                        'proof_path'     => $path,
                        'provenance'     => 'admin',
                        'created_at'     => $res->updated_at ?? now(),
                        'updated_at'     => $res->updated_at ?? now(),
                    ]);
                }
            } elseif ($totalAmount > 0) {
                // Payment exists but no proof path recorded yet
                \Illuminate\Support\Facades\DB::table('payments')->insert([
                    'id_reservation' => $res->id,
                    'amount'         => $totalAmount,
                    'payment_date'   => $res->updated_at ?? now(),
                    'provenance'     => 'admin',
                    'created_at'     => $res->updated_at ?? now(),
                    'updated_at'     => $res->updated_at ?? now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

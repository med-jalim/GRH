<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class FixReservationPrices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fix-reservation-prices';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalculate total prices for all reservations based on nights, quantity and unit price.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $reservations = \App\Models\Reservation::with(['details', 'payments'])->get();
        $count = 0;

        foreach ($reservations as $reservation) {
            $dateArrivee = \Carbon\Carbon::parse($reservation->date_arrivee);
            $dateDepart = \Carbon\Carbon::parse($reservation->date_depart);
            $nights = max(1, $dateArrivee->diffInDays($dateDepart));

            $total = 0;
            foreach ($reservation->details as $item) {
                $total += ($item->quantite * $item->prix_unitaire * $nights);
            }

            $paid = $reservation->payments->where('statut', 'valide')->sum('amount');

            if ($reservation->prix_total != $total || $reservation->paid_amount != $paid) {
                $this->info("Updating reservation {$reservation->code_reference}: old price {$reservation->prix_total} -> new price {$total}");
                $reservation->update([
                    'prix_total' => $total,
                    'paid_amount' => $paid
                ]);
                $count++;
            }
        }

        $this->info("Successfully updated {$count} reservations.");
    }
}

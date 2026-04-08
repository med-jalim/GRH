<?php

namespace App\Observers;

use App\Models\Tarif;
use App\Models\Hotel;
use Illuminate\Support\Facades\Log;

class TarifObserver
{
    /**
     * Handle the Tarif "saved" event.
     */
    public function saved(Tarif $tarif): void
    {
        // Prevent recursive calls if already inside withoutEvents
        // But Tarif::withoutEvents inside should handle it.
        
        $hotel = $tarif->hotel;
        if (!$hotel || !$hotel->main_type_id) {
            return;
        }

        // If this is the main type price being updated, sync other types
        if ($tarif->id_type == $hotel->main_type_id) {
            $this->syncSecondaryPrices($tarif, $hotel);
        }
    }

    /**
     * Synchronize secondary prices based on the main price and pricing rules.
     */
    private function syncSecondaryPrices(Tarif $mainTarif, Hotel $hotel): void
    {
        $rules = $hotel->pricingRules()->get();

        foreach ($rules as $rule) {
            // Avoid syncing the main type itself if it somehow exists in rules
            if ($rule->id_type == $hotel->main_type_id) {
                continue;
            }

            // Calculate price without rounding
            $percentage = (float)$rule->percentage;
            $newPrice = (float)$mainTarif->prix * ($percentage / 100);

            // Update or create the secondary price for the same period
            // We use withoutEvents to avoid infinite recursion
            Tarif::withoutEvents(function () use ($mainTarif, $rule, $newPrice) {
                Tarif::applyRangeSplit(
                    hotelId:   $mainTarif->id_hotel,
                    typeId:    $rule->id_type,
                    newStart:  $mainTarif->date_debut->format('Y-m-d'),
                    newEnd:    $mainTarif->date_fin->format('Y-m-d'),
                    newPrice:  $newPrice
                );
            });
        }
    }
}

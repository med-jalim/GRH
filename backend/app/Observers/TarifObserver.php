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
        // Pricing Rules sync is disabled for now as per user request
        /*
        $hotel = $tarif->hotel;
        if (!$hotel || !$hotel->main_type_id) {
            return;
        }

        if ($tarif->id_type == $hotel->main_type_id) {
            $this->syncSecondaryPrices($tarif, $hotel);
        }
        */
    }

    /**
     * Synchronize secondary prices based on the main price and pricing rules.
     */
    private function syncSecondaryPrices(Tarif $mainTarif, Hotel $hotel): void
    {
        $rules = $hotel->pricingRules()->get();
        $mainCapacity = $mainTarif->capacity;

        foreach ($rules as $rule) {
            if ($rule->id_type == $hotel->main_type_id) {
                continue;
            }

            // Find matching capacity in the target room type by LABEL
            $targetCapacityId = null;
            if ($mainCapacity && $mainCapacity->label) {
                $targetCapacity = $hotel->typeCapacities()
                    ->where('id_type', (int) $rule->id_type)
                    ->where('label', $mainCapacity->label)
                    ->first();
                
                if ($targetCapacity) {
                    $targetCapacityId = $targetCapacity->id;
                } else {
                    // Skip if no matching label is found
                    continue; 
                }
            }

            $percentage = (float)$rule->percentage;
            $newPrice = (float)$mainTarif->prix * ($percentage / 100);

            Tarif::withoutEvents(function () use ($mainTarif, $rule, $newPrice, $targetCapacityId) {
                Tarif::applyRangeSplit(
                    hotelId:   (int) $mainTarif->id_hotel,
                    typeId:    (int) $rule->id_type,
                    capacityId: $targetCapacityId ? (int) $targetCapacityId : null,
                    newStart:  $mainTarif->date_debut->format('Y-m-d'),
                    newEnd:    $mainTarif->date_fin->format('Y-m-d'),
                    newPrice:  (float) $newPrice
                );
            });
        }
    }
}

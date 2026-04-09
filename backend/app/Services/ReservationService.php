<?php

namespace App\Services;

use App\Models\Chambre;
use App\Models\ItemReservation;
use App\Models\HotelTypeTarification;
use Carbon\Carbon;

class ReservationService
{
    /**
     * Check if room types are available for each stay segment (now grouped).
     */
    public function checkAvailability(int $hotelId, array $groups, ?int $excludeReservationId = null): array
    {
        $failures = [];

        foreach ($groups as $gIndex => $group) {
            $start = Carbon::parse($group['date_arrivee'] ?? $group['checkIn']);
            $end = Carbon::parse($group['date_depart'] ?? $group['checkOut']);
            $groupRooms = $group['details'] ?? $group['rooms'] ?? [];

            foreach ($groupRooms as $rIndex => $room) {
                $typeId = $room['id_type'] ?? $room['roomTypeId'];
                $requestedQty = $room['quantite'] ?? $room['quantity'];

                // 1. Total rooms of this type in this hotel
                $totalRooms = Chambre::where('id_hotel', $hotelId)
                    ->where('id_type', $typeId)
                    ->count();

                // 2. Occupied rooms in DB for this period
                $occupiedInDB = ItemReservation::where('id_type', $typeId)
                    ->whereHas('group.reservation', function($query) use ($hotelId, $excludeReservationId) {
                        $query->where('id_hotel', $hotelId)
                              ->whereNotIn('statut', ['annule', 'refuse']);
                        if ($excludeReservationId) {
                            $query->where('id', '!=', $excludeReservationId);
                        }
                    })
                    ->whereHas('group', function($query) use ($start, $end) {
                        $query->where('date_arrivee', '<', $end)
                              ->where('date_depart', '>', $start);
                    })
                    ->sum('quantite');

                // 3. Subtract rooms already selected in OTHER groups of this current request
                // that overlap with this current group's period.
                $currentRequestConsumption = 0;
                foreach ($groups as $otherIndex => $otherGroup) {
                    if ($otherIndex === $gIndex) continue; // Don't subtract self

                    $oStart = Carbon::parse($otherGroup['date_arrivee'] ?? $otherGroup['checkIn']);
                    $oEnd = Carbon::parse($otherGroup['date_depart'] ?? $otherGroup['checkOut']);

                    // If periods overlap
                    if ($start < $oEnd && $oStart < $end) {
                        $otherRooms = $otherGroup['details'] ?? $otherGroup['rooms'] ?? [];
                        foreach ($otherRooms as $otherRoom) {
                            $oTypeId = $otherRoom['id_type'] ?? $otherRoom['roomTypeId'];
                            if ($oTypeId == $typeId) {
                                $currentRequestConsumption += ($otherRoom['quantite'] ?? $otherRoom['quantity'] ?? 0);
                            }
                        }
                    }
                }

                if (($totalRooms - $occupiedInDB - $currentRequestConsumption) < $requestedQty) {
                    $failures[] = "Le type de chambre sélectionné dans le groupe " . ($gIndex + 1) . " n'est pas disponible pour les dates choisies (Déjà utilisé dans d'autres groupes ou complet).";
                }
            }
        }

        return $failures;
    }

    /**
     * Check detailed availability per room selection.
     */
    public function checkDetailedAvailability(int $hotelId, array $groups, ?int $excludeReservationId = null): array
    {
        $results = [];

        foreach ($groups as $gIndex => $group) {
            $start = Carbon::parse($group['date_arrivee'] ?? $group['checkIn']);
            $end = Carbon::parse($group['date_depart'] ?? $group['checkOut']);
            $groupRooms = $group['details'] ?? $group['rooms'] ?? [];
            
            $groupResults = [];

            foreach ($groupRooms as $rIndex => $room) {
                $typeId = $room['id_type'] ?? $room['roomTypeId'] ?? 0;
                $requestedQty = $room['quantite'] ?? $room['quantity'] ?? 1;
                $roomUid = $room['uid'] ?? null;

                if (!$typeId) {
                    $groupResults[] = ['uid' => $roomUid, 'available' => true, 'remaining' => 0];
                    continue;
                }

                // Total rooms of this type
                $totalRooms = Chambre::where('id_hotel', $hotelId)
                    ->where('id_type', $typeId)
                    ->count();

                // Occupied in DB
                $occupiedInDB = ItemReservation::where('id_type', $typeId)
                    ->whereHas('group.reservation', function($query) use ($hotelId, $excludeReservationId) {
                        $query->where('id_hotel', $hotelId)
                              ->whereNotIn('statut', ['annule', 'refuse']);
                        if ($excludeReservationId) {
                            $query->where('id', '!=', $excludeReservationId);
                        }
                    })
                    ->whereHas('group', function($query) use ($start, $end) {
                        $query->where('date_arrivee', '<', $end)
                              ->where('date_depart', '>', $start);
                    })
                    ->sum('quantite');

                // Internal consumption in this request (other groups)
                $requestConsumption = 0;
                foreach ($groups as $otherIndex => $otherGroup) {
                    if ($otherIndex === $gIndex) continue;
                    
                    $oStart = Carbon::parse($otherGroup['date_arrivee'] ?? $otherGroup['checkIn']);
                    $oEnd = Carbon::parse($otherGroup['date_depart'] ?? $otherGroup['checkOut']);

                    if ($start < $oEnd && $oStart < $end) {
                        $otherRooms = $otherGroup['details'] ?? $otherGroup['rooms'] ?? [];
                        foreach ($otherRooms as $otherRoom) {
                            $oTypeId = $otherRoom['id_type'] ?? $otherRoom['roomTypeId'];
                            if ($oTypeId == $typeId) {
                                $requestConsumption += ($otherRoom['quantite'] ?? $otherRoom['quantity'] ?? 0);
                            }
                        }
                    }
                }

                $effectiveRemaining = $totalRooms - $occupiedInDB - $requestConsumption;
                
                // Fetch capacities for this hotel/type
                $tarification = HotelTypeTarification::where('id_hotel', $hotelId)
                    ->where('id_type', $typeId)
                    ->first();

                $groupResults[] = [
                    'uid' => $roomUid,
                    'available' => $effectiveRemaining >= $requestedQty,
                    'remaining' => max(0, $effectiveRemaining),
                    'total' => $totalRooms,
                    'capacities' => $tarification ? [
                        'cap_adultes' => $tarification->cap_adultes,
                        'cap_enfants' => $tarification->cap_enfants,
                        'cap_bebes'   => $tarification->cap_bebes,
                    ] : null
                ];
            }
            $results[] = [
                'uid' => $group['uid'] ?? null,
                'rooms' => $groupResults
            ];
        }

        return $results;
    }

    /**
     * Calculate stay duration in nights.
     */
    public function calculateNights($startDate, $endDate): int
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $nights = $start->diffInDays($end);
        return max(1, $nights);
    }
}

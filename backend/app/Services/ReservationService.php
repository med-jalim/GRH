<?php

namespace App\Services;

use App\Models\Chambre;
use App\Models\ItemReservation;
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

                // Total rooms of this type in this hotel
                $totalRooms = Chambre::where('id_hotel', $hotelId)
                    ->where('id_type', $typeId)
                    ->count();

                // Occupied rooms of this type in this hotel during the period
                // Now linking through group relationship
                $occupiedRooms = ItemReservation::where('id_type', $typeId)
                    ->whereHas('group.reservation', function($query) use ($hotelId, $excludeReservationId) {
                        $query->where('id_hotel', $hotelId)
                              ->whereNotIn('statut', ['annule']);
                        if ($excludeReservationId) {
                            $query->where('id', '!=', $excludeReservationId);
                        }
                    })
                    ->whereHas('group', function($query) use ($start, $end) {
                        $query->where('date_arrivee', '<', $end)
                              ->where('date_depart', '>', $start);
                    })
                    ->sum('quantite');

                if (($totalRooms - $occupiedRooms) < $requestedQty) {
                    $failures[] = "Le type de chambre sélectionné dans le groupe " . ($gIndex + 1) . " n'est pas disponible pour les dates choisies.";
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

                // Total rooms of this type in this hotel
                $totalRooms = Chambre::where('id_hotel', $hotelId)
                    ->where('id_type', $typeId)
                    ->count();

                // Occupied rooms
                $occupiedRooms = ItemReservation::where('id_type', $typeId)
                    ->whereHas('group.reservation', function($query) use ($hotelId, $excludeReservationId) {
                        $query->where('id_hotel', $hotelId)
                              ->whereNotIn('statut', ['annule']);
                        if ($excludeReservationId) {
                            $query->where('id', '!=', $excludeReservationId);
                        }
                    })
                    ->whereHas('group', function($query) use ($start, $end) {
                        $query->where('date_arrivee', '<', $end)
                              ->where('date_depart', '>', $start);
                    })
                    ->sum('quantite');

                $remaining = $totalRooms - $occupiedRooms;
                
                $groupResults[] = [
                    'uid' => $roomUid,
                    'available' => $remaining >= $requestedQty,
                    'remaining' => max(0, $remaining),
                    'total' => $totalRooms
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

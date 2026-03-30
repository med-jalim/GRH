<?php

namespace App\Http\Controllers;

use App\Models\ItemReservation;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReservationController extends Controller
{
    /**
     * Display a listing of reservations, optionally filtered by hotel or status.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Reservation::with(['hotel', 'details.type']);

        if ($request->has('id_hotel')) {
            $query->where('id_hotel', $request->id_hotel);
        }

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        $reservations = $query->orderByDesc('created_at')->paginate(15);

        return response()->json([
            'success' => true,
            'data'    => $reservations,
        ]);
    }

    /**
     * Store a newly created reservation with its line items.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom_agence'          => 'nullable|string|max:255',
            'nom_contact'         => 'required|string|max:255',
            'code_agence'         => 'nullable|string|max:100',
            'email'               => 'required|email|max:255',
            'telephone'           => 'required|string|max:30',
            'id_hotel'            => 'required|integer|exists:hotels,id',
            'date_arrivee'        => 'required|date',
            'date_depart'         => 'required|date|after:date_arrivee',
            'nb_personnes'        => 'required|integer|min:1',
            'remarques_speciales' => 'nullable|string',
            'statut'              => 'nullable|string|in:en_attente,confirmée,annulée',

            // Line items
            'details'                  => 'nullable|array',
            'details.*.id_type'        => 'required_with:details|integer|exists:types,id',
            'details.*.quantite'       => 'required_with:details|integer|min:1',
            'details.*.prix_unitaire'  => 'required_with:details|numeric|min:0',
        ]);

        // Auto-generate a unique reference code
        $validated['code_reference'] = 'RES-' . strtoupper(Str::random(8));
        $validated['statut']         = $validated['statut'] ?? 'en_attente';

        // Calculate total price from details
        $prixTotal = 0;
        if (! empty($validated['details'])) {
            foreach ($validated['details'] as $detail) {
                $prixTotal += $detail['quantite'] * $detail['prix_unitaire'];
            }
        }
        $validated['prix_total'] = $prixTotal;

        $details = $validated['details'] ?? [];
        unset($validated['details']);

        $reservation = Reservation::create($validated);

        // Create line items
        foreach ($details as $detail) {
            $detail['id_reservation'] = $reservation->id;
            ItemReservation::create($detail);
        }

        $reservation->load(['hotel', 'details.type']);

        return response()->json([
            'success' => true,
            'message' => 'Réservation créée avec succès.',
            'data'    => $reservation,
        ], 201);
    }

    /**
     * Display the specified reservation with all details.
     */
    public function show(string $id): JsonResponse
    {
        $reservation = Reservation::with(['hotel', 'details.type'])->find($id);

        if (! $reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Réservation introuvable.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $reservation,
        ]);
    }

    /**
     * Update the specified reservation.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $reservation = Reservation::find($id);

        if (! $reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Réservation introuvable.',
            ], 404);
        }

        $validated = $request->validate([
            'nom_agence'          => 'nullable|string|max:255',
            'nom_contact'         => 'sometimes|required|string|max:255',
            'code_agence'         => 'nullable|string|max:100',
            'email'               => 'sometimes|required|email|max:255',
            'telephone'           => 'sometimes|required|string|max:30',
            'id_hotel'            => 'sometimes|required|integer|exists:hotels,id',
            'date_arrivee'        => 'sometimes|required|date',
            'date_depart'         => 'sometimes|required|date|after:date_arrivee',
            'nb_personnes'        => 'sometimes|required|integer|min:1',
            'prix_total'          => 'sometimes|numeric|min:0',
            'remarques_speciales' => 'nullable|string',
            'statut'              => 'nullable|string|in:en_attente,confirmée,annulée',
        ]);

        $reservation->update($validated);
        $reservation->load(['hotel', 'details.type']);

        return response()->json([
            'success' => true,
            'message' => 'Réservation mise à jour avec succès.',
            'data'    => $reservation,
        ]);
    }

    /**
     * Update only the status of a reservation.
     */
    public function updateStatut(Request $request, string $id): JsonResponse
    {
        $reservation = Reservation::find($id);

        if (! $reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Réservation introuvable.',
            ], 404);
        }

        $validated = $request->validate([
            'statut' => 'required|string|in:en_attente,confirmée,annulée',
        ]);

        $reservation->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Statut mis à jour avec succès.',
            'data'    => $reservation,
        ]);
    }

    /**
     * Remove the specified reservation along with its line items.
     */
    public function destroy(string $id): JsonResponse
    {
        $reservation = Reservation::find($id);

        if (! $reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Réservation introuvable.',
            ], 404);
        }

        // Delete line items first
        $reservation->details()->delete();
        $reservation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Réservation supprimée avec succès.',
        ]);
    }
}

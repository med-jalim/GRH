<?php

namespace App\Http\Controllers;

use App\Mail\PaymentRequired;
use App\Mail\ReservationCancelled;
use App\Mail\ReservationConfirmed;
use App\Mail\ReservationStatusUpdated;
use App\Mail\ReservationValidationRequest;
use App\Models\ItemReservation;
use App\Models\Reservation;
use App\Models\User;
use App\Notifications\AdminNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ReservationController extends Controller
{
    /**
     * Display a listing of reservations, optionally filtered by hotel or status.
     */
    public function index(Request $request): InertiaResponse|JsonResponse
    {
        $baseQuery = Reservation::query();

        if ($request->has('id_hotel') && $request->id_hotel !== null && $request->id_hotel !== '') {
            $baseQuery->where('id_hotel', $request->id_hotel);
        }

        // Stats counts (always across the full unfiltered-by-status scope)
        $stats = [
            'total'               => (clone $baseQuery)->count(),
            'en_attente'          => (clone $baseQuery)->where('statut', 'en_attente')->count(),
            'en_validation'       => (clone $baseQuery)->where('statut', 'en_validation')->count(),
            'valide'              => (clone $baseQuery)->where('statut', 'valide')->count(),
            'en_attente_paiement' => (clone $baseQuery)->where('statut', 'en_attente_paiement')->count(),
            'partiellement_paye'  => (clone $baseQuery)->where('statut', 'partiellement_paye')->count(),
            'confirme'            => (clone $baseQuery)->where('statut', 'confirme')->count(),
            'annule'              => (clone $baseQuery)->where('statut', 'annule')->count(),
        ];

        if ($request->has('statut') && $request->statut !== null && $request->statut !== '' && $request->statut !== 'all') {
            $baseQuery->where('statut', $request->statut);
        }

        $reservations = $baseQuery->with(['hotel', 'details.type'])
            ->orderByDesc('created_at')
            ->paginate(15);

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return $this->sendResponse($reservations, 'Liste des réservations récupérée avec succès.');
        }

        return Inertia::render('Admin/Reservations/Index', [
            'reservations' => $reservations,
            'filters'      => $request->only(['id_hotel', 'statut']),
            'stats'        => $stats,
        ]);
    }

    /**
     * Store a newly created reservation with its line items.
     */
    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'nom_agence'          => 'nullable|string|max:255',
            'code_agence'         => 'required|string|max:100',
            'nom_contact'         => 'required|string|max:255',
            'email'               => 'required|email|max:255',
            'telephone'           => 'required|string|max:30',
            'id_hotel'            => 'required|integer|exists:hotels,id',
            'date_arrivee'        => 'required|date',
            'date_depart'         => 'required|date|after:date_arrivee',
            'nb_personnes'        => 'required|integer|min:1',
            'remarques_speciales' => 'nullable|string',
            'statut'              => 'nullable|string|in:en_attente,confirme,annule',

            // Line items
            'details'                  => 'nullable|array',
            'details.*.id_type'        => 'required_with:details|integer|exists:types,id',
            'details.*.quantite'       => 'required_with:details|integer|min:1',
            'details.*.prix_unitaire'  => 'required_with:details|numeric|min:0',
        ]);

        // Auto-generate a unique reference code
        $validated['code_reference'] = 'RES-' . strtoupper(Str::random(8));
        $validated['statut']         = $validated['statut'] ?? 'en_attente';

        // Recalculate total price for safety
        $dateArrivee = \Carbon\Carbon::parse($validated['date_arrivee']);
        $dateDepart = \Carbon\Carbon::parse($validated['date_depart']);
        $nights = $dateArrivee->diffInDays($dateDepart);
        if ($nights < 1) $nights = 1;

        $details = $validated['details'] ?? [];
        $prixTotal = 0;
        foreach ($details as $d) {
            $prixTotal += ($d['quantite'] * $d['prix_unitaire'] * $nights);
        }
        $validated['prix_total'] = $prixTotal;

        unset($validated['details']);
        $reservation = Reservation::create($validated);

        // Notify admins about the new reservation
        try {
            $admins = User::all();
            Notification::send($admins, new AdminNotification(
                'Nouvelle Réservation',
                'Une nouvelle réservation (' . $reservation->code_reference . ') a été créée par ' . $reservation->nom_contact . '.',
                route('admin.reservations.show', $reservation->id)
            ));
        } catch (\Exception $e) {
            Log::error('Failed to send admin notification for new reservation: ' . $e->getMessage());
        }

        // Create line items
        foreach ($details as $detail) {
            $detail['id_reservation'] = $reservation->id;
            ItemReservation::create($detail);
        }


        $reservation->load(['hotel', 'details.type']);

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return $this->sendResponse($reservation, 'Réservation créée avec succès.', 201);
        }
        
        return redirect()->back()->with([
            'success' => 'Votre réservation a été enregistrée avec succès.',
            'reference' => $reservation->code_reference,
            'reservation' => $reservation,
        ]);
    }

    /**
     * Display the specified reservation with all details.
     */
    public function show(string $id): InertiaResponse|JsonResponse|RedirectResponse
    {
        $reservation = Reservation::with(['hotel', 'details.type', 'payments'])->find($id);

        if (! $reservation) {
            if (request()->wantsJson() && ! request()->header('X-Inertia')) {
                return $this->sendError('Réservation introuvable.');
            }
            return redirect()->route('admin.reservations.index')->with('error', 'Réservation introuvable.');
        }

        if (request()->wantsJson() && ! request()->header('X-Inertia')) {
            return $this->sendResponse($reservation, 'Détails de la réservation récupérés avec succès.');
        }

        return Inertia::render('Admin/Reservations/Show', [
            'reservation' => $reservation,
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
            'statut'              => 'nullable|string|in:en_attente,confirme,annule',
        ]);

        $reservation->update($validated);

        // Recalculate total if dates or line items might have changed
        // Note: Currently admin update doesn't handle line items, but we should update total if dates change
        $dateArrivee = \Carbon\Carbon::parse($reservation->date_arrivee);
        $dateDepart = \Carbon\Carbon::parse($reservation->date_depart);
        $nights = $dateArrivee->diffInDays($dateDepart);
        if ($nights < 1) $nights = 1;

        $prixTotal = 0;
        foreach ($reservation->details as $d) {
            $subtotal = ($d->quantite * $d->prix_unitaire * $nights);
            $prixTotal += $subtotal;
        }
        $reservation->prix_total = $prixTotal;
        $reservation->save();

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
    public function updateStatut(Request $request, string $id): JsonResponse|RedirectResponse
    {
        $reservation = Reservation::with('hotel')->find($id);

        if (! $reservation) {
            if ($request->wantsJson() && ! $request->header('X-Inertia')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Réservation introuvable.',
                ], 404);
            }
            return redirect()->back()->with('error', 'Réservation introuvable.');
        }

        $validated = $request->validate([
            'statut'       => 'required|string|in:en_attente,en_attente_paiement,confirme,annule,en_validation,valide,partiellement_paye',
            'message'      => 'required_if:statut,annule|nullable|string',
            'payment_link' => 'required_if:statut,en_attente_paiement|nullable|string|url',
        ]);


        // Capture old status before update
        $previousStatut = $reservation->statut;
        $newStatut      = $validated['statut'];

        $updateData = ['statut' => $newStatut];
        if (isset($validated['payment_link'])) {
            $updateData['payment_link'] = $validated['payment_link'];
        }

        $reservation->update($updateData);

        // Send email notification only if status actually changed
        if ($previousStatut !== $newStatut) {
            try {
                if ($newStatut === 'en_validation') {
                    Mail::to($reservation->email)->send(new ReservationValidationRequest($reservation));
                } elseif ($newStatut === 'confirme') {
                    Mail::to($reservation->email)->send(new ReservationConfirmed($reservation));
                } elseif ($newStatut === 'annule') {
                    Mail::to($reservation->email)->send(new ReservationCancelled($reservation, $validated['message'] ?? null));
                } elseif ($newStatut === 'en_attente_paiement') {
                    Mail::to($reservation->email)->send(new PaymentRequired($reservation));
                } elseif ($newStatut !== 'en_attente') {
                    // Fallback to generic if we add more statuses later
                    Mail::to($reservation->email)
                        ->send(new ReservationStatusUpdated($reservation, $previousStatut, $validated['message'] ?? null));
                }
            } catch (\Throwable $e) {
                Log::error('Failed to send status email', [
                    'reservation_id' => $reservation->id,
                    'error'          => $e->getMessage(),
                ]);
            }
        }

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'message' => 'Statut mis à jour avec succès.',
                'data'    => $reservation,
            ]);
        }

        return redirect()->back()->with('success', 'Statut mis à jour avec succès.');
    }

    /**
     * Remove the specified reservation along with its line items.
     */
    public function destroy(string $id): JsonResponse|RedirectResponse
    {
        $reservation = Reservation::find($id);

        if (! $reservation) {
            if (request()->wantsJson() && ! request()->header('X-Inertia')) {
                return $this->sendError('Réservation introuvable.');
            }
            return redirect()->back()->with('error', 'Réservation introuvable.');
        }

        // Delete line items first
        $reservation->details()->delete();
        $reservation->delete();

        if (request()->wantsJson() && ! request()->header('X-Inertia')) {
            return $this->sendResponse(null, 'Réservation supprimée avec succès.');
        }

        return redirect()->route('admin.reservations.index')->with('success', 'Réservation supprimée avec succès.');
    }
}

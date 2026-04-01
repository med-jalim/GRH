<?php

namespace App\Http\Controllers;

use App\Mail\ReservationStatusUpdated;
use App\Models\ItemReservation;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
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
            'en_attente_paiement' => (clone $baseQuery)->where('statut', 'en_attente_paiement')->count(),
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
            'prix_total'          => 'required|numeric|min:0',
            'remarques_speciales' => 'nullable|string',
            'statut'              => 'nullable|string|in:en_attente,en_attente_paiement,confirme,annule',

            // Line items
            'details'                  => 'nullable|array',
            'details.*.id_type'        => 'required_with:details|integer|exists:types,id',
            'details.*.quantite'       => 'required_with:details|integer|min:1',
            'details.*.prix_unitaire'  => 'required_with:details|numeric|min:0',
        ]);

        // Auto-generate a unique reference code
        $validated['code_reference'] = 'RES-' . strtoupper(Str::random(8));
        $validated['statut']         = $validated['statut'] ?? 'en_attente';

        // Calculate nights
        $checkIn = new \DateTime($validated['date_arrivee']);
        $checkOut = new \DateTime($validated['date_depart']);
        $nights = $checkOut->diff($checkIn)->days;
        $nights = max(1, $nights);

        // Calculate total price from details (verifying against nights)
        $prixTotalCalculated = 0;
        if (! empty($validated['details'])) {
            foreach ($validated['details'] as $detail) {
                $prixTotalCalculated += $detail['quantite'] * $detail['prix_unitaire'] * $nights;
            }
        }

        // We use the calculated price to ensure integrity, 
        // but we could also validate that $validated['prix_total'] matches $prixTotalCalculated
        $validated['prix_total'] = $prixTotalCalculated;

        $details = $validated['details'] ?? [];
        unset($validated['details']);

        $reservation = Reservation::create($validated);

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
        $reservation = Reservation::with(['hotel', 'details.type'])->find($id);

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
            'statut'              => 'nullable|string|in:en_attente,en_attente_paiement,confirme,annule',
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
            'statut' => 'required|string|in:en_attente,en_attente_paiement,confirme,annule',
        ]);


        // Capture old status before update
        $previousStatut = $reservation->statut;
        $newStatut      = $validated['statut'];

        $reservation->update($validated);
        $reservation->refresh();

        // Send email notification only if status actually changed
        if ($previousStatut !== $newStatut) {
            try {
                Mail::to($reservation->email)
                    ->send(new ReservationStatusUpdated($reservation, $previousStatut));
            } catch (\Throwable $e) {
                // Log the failure but don't block the response
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

    /**
     * Admin: Update payment info (link, amount confirmed, payment status).
     */
    public function updatePaymentInfo(Request $request, string $id): RedirectResponse
    {
        $reservation = Reservation::with('hotel')->findOrFail($id);

        $validated = $request->validate([
            'lien_paiement'   => 'nullable|string|max:2000',
            'montant_paye'    => 'nullable|numeric|min:0',
            'statut_paiement' => 'nullable|string|in:non_paye,en_attente_verification,paye',
        ]);

        $updateData = array_filter($validated, fn($v) => $v !== null);

        // Automation: If payment status is 'paye', set reservation status to 'confirme'
        if (isset($validated['statut_paiement']) && $validated['statut_paiement'] === 'paye') {
            $updateData['statut'] = 'confirme';
        }

        $reservation->update($updateData);

        return redirect()->back()->with('success', 'Informations de paiement mises à jour.');
    }

    /**
     * Admin: Explicitly send payment link and change status to 'en_attente_paiement'.
     */
    public function sendPaymentLink(Request $request, string $id): RedirectResponse
    {
        $reservation = Reservation::with('hotel')->findOrFail($id);

        $validated = $request->validate([
            'lien_paiement' => 'required|string|max:2000',
        ]);

        $previousStatut = $reservation->statut;

        $reservation->update([
            'lien_paiement' => $validated['lien_paiement'],
            'statut'        => 'en_attente_paiement',
        ]);

        $reservation->refresh();

        try {
            Mail::to($reservation->email)
                ->send(new ReservationStatusUpdated($reservation, $previousStatut));
        } catch (\Throwable $e) {
            Log::error('Failed to send payment link email', [
                'reservation_id' => $reservation->id,
                'error'          => $e->getMessage(),
            ]);
            return redirect()->back()->with('error', 'Lien enregistré mais échec lors de l\'envoi de l\'email.');
        }

        return redirect()->back()->with('success', 'Lien de paiement envoyé avec succès. Le statut est passé à "En attente de paiement".');
    }

    /**
     * Admin: Add a partial payment to a reservation.
     * Increments montant_paye and appends a new receipt to preuve_paiement array.
     */
    public function addPayment(Request $request, string $id): RedirectResponse
    {
        $reservation = Reservation::findOrFail($id);

        $validated = $request->validate([
            'montant'         => 'required|numeric|min:0.01',
            'preuve_paiement' => 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:8192',
            'notes'           => 'nullable|string|max:500',
        ]);

        // 1. Calculate new total
        $currentPaid = (float) $reservation->montant_paye;
        $newAmount   = (float) $validated['montant'];
        $totalPaid   = $currentPaid + $newAmount;

        // 2. Check if total exceeds prix_total
        if ($totalPaid > $reservation->prix_total + 0.01) { // Small epsilon for float comparison
            return redirect()->back()->with('error', 'Le montant total payé ne peut pas dépasser le prix total de la réservation.');
        }

        // 3. Upload new proof
        $path = $request->file('preuve_paiement')->store('proofs', 'public');

        // 4. Update array of proofs
        $proofs = $reservation->preuve_paiement ?? [];
        if (!is_array($proofs)) $proofs = [];
        $proofs[] = $path;

        // 5. Determine payment status
        $statutPaiement = 'en_attente_verification';
        $previousStatut = $reservation->statut;
        $statut = $reservation->statut;

        if (abs($totalPaid - $reservation->prix_total) < 0.01) {
            $statutPaiement = 'paye';
            $statut         = 'confirme';
        }

        $reservation->update([
            'montant_paye'    => $totalPaid,
            'preuve_paiement' => $proofs,
            'statut_paiement' => $statutPaiement,
            'statut'          => $statut,
        ]);
        if($statut == 'confirme') {
            $reservation->refresh();
            try {
                Mail::to($reservation->email)
                    ->send(new ReservationStatusUpdated($reservation, $previousStatut));
            } catch (\Throwable $e) {
                // Log the failure but don't block the response
                Log::error('Failed to send status email', [
                    'reservation_id' => $reservation->id,
                    'error'          => $e->getMessage(),
                ]);
            }
        }

        return redirect()->back()->with('success', 'Paiement de ' . $newAmount . ' MAD enregistré avec succès.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Mail\ReservationStatusUpdated;
use App\Mail\PaymentVerified;
use App\Mail\PaymentRejected;
use App\Models\ItemReservation;
use App\Models\Reservation;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Crypt;
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
            'en_verification'     => (clone $baseQuery)->where('statut', 'en_verification')->count(),
            'valide'              => (clone $baseQuery)->where('statut', 'valide')->count(),
            'en_attente_paiement' => (clone $baseQuery)->where('statut', 'en_attente_paiement')->count(),
            'paye_partiellement'  => (clone $baseQuery)->where('statut', 'paye_partiellement')->count(),
            'confirme'            => (clone $baseQuery)->where('statut', 'confirme')->count(),
            'annule'              => (clone $baseQuery)->where('statut', 'annule')->count(),
        ];

        if ($request->has('statut') && $request->statut !== null && $request->statut !== '' && $request->statut !== 'all') {
            $statuses = explode(',', $request->statut);
            $baseQuery->whereIn('statut', $statuses);
        }

        $reservations = $baseQuery->with(['hotel', 'details.type', 'groups'])
            ->withCount('groups')
            ->withSum('details as total_items', 'quantite')
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
     * Get non-paginated reservation data for the calendar view.
     */
    public function getCalendarData(Request $request): JsonResponse
    {
        $query = Reservation::with(['hotel', 'groups']);

        if ($request->has('id_hotel') && $request->id_hotel !== null && $request->id_hotel !== '') {
            $query->where('id_hotel', $request->id_hotel);
        }

        if ($request->has('statut') && $request->statut !== null && $request->statut !== '' && $request->statut !== 'all') {
            $statuses = explode(',', $request->statut);
            $query->whereIn('statut', $statuses);
        }

        // Ideally, we'd also filter by a date range (start/end) provided by the frontend
        // to avoid loading the entire database history in production.
        if ($request->has('start') && $request->has('end')) {
             $query->where(function($q) use ($request) {
                 $q->whereBetween('date_arrivee', [$request->start, $request->end])
                   ->orWhereBetween('date_depart', [$request->start, $request->end])
                   ->orWhere(function($q2) use ($request) {
                       $q2->where('date_arrivee', '<=', $request->start)
                          ->where('date_depart', '>=', $request->end);
                   });
             });
        }

        $reservations = $query->get();

        return response()->json([
            'success' => true,
            'data' => $reservations
        ]);
    }

    /**
     * Store a newly created reservation with its line items.
     */
    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'client_type'         => 'required|string|in:agence,groupe',
            'nom_agence'          => 'nullable|string|max:255',
            'code_agence'         => 'required_if:client_type,agence|nullable|string|max:100',
            'nom_contact'         => 'required|string|max:255',
            'email'               => 'required|email|max:255',
            'telephone'           => 'required|string|max:30',
            'id_hotel'            => 'required|integer|exists:hotels,id',
            'remarques_speciales' => 'nullable|string',
            'statut'              => 'nullable|string|in:en_attente,en_attente_paiement,confirme,annule',
                                                                                                                                                                                        
            // Nested Groups & Items
            'groups'                  => 'required|array|min:1',
            'groups.*.date_arrivee'   => 'required|date',
            'groups.*.date_depart'    => 'required|date|after:groups.*.date_arrivee',
            'groups.*.nb_personnes'   => 'nullable|integer|min:0',
            'groups.*.items'                  => 'required|array|min:1',
            'groups.*.items.*.id_type'        => 'required|integer|exists:types,id',
            'groups.*.items.*.id_capacity'    => 'required|integer|exists:hotel_type_capacities,id',
            'groups.*.items.*.quantite'       => 'required|integer|min:1',
            'groups.*.items.*.prix_unitaire'  => 'required|numeric|min:0',
            'groups.*.items.*.nb_adultes'     => 'required|integer|min:0',
            'groups.*.items.*.nb_enfants'     => 'nullable|integer|min:0',
        ]);

        // Custom Occupancy Validation
        foreach ($validated['groups'] as $gIdx => $group) {
            foreach ($group['items'] as $iIdx => $item) {
                $capacity = \App\Models\HotelTypeCapacity::find($item['id_capacity']);
                if ($capacity) {
                    $totalPax = ($item['nb_adultes'] ?? 0) + ($item['nb_enfants'] ?? 0);
                    $maxTotal = $capacity->capacite_totale ?: ($capacity->capacite_adultes + $capacity->capacite_enfants);
                    
                    if ($totalPax > $maxTotal) {
                        return response()->json([
                            'success' => false,
                            'message' => "La configuration \"{$capacity->label}\" ne peut pas dépasser {$maxTotal} personnes (Adultes + Enfants).",
                            'errors' => ["groups.{$gIdx}.items.{$iIdx}.pax" => "Capacité dépassée"]
                        ], 422);
                    }
                }
            }
        }

        // Auto-generate a unique reference code
        $validated['code_reference'] = 'RES-' . strtoupper(Str::random(8));
        $validated['statut']         = $validated['statut'] ?? 'en_attente';
        
        $groups = $validated['groups'];

        // --- GLOBAL MIN ROOMS VALIDATION ---
        $totalRoomsSum = collect($groups)->sum(function($g) {
            return collect($g['items'])->sum('quantite');
        });
        $minRoomsSetting = (int) \App\Models\GlobalSetting::get('min_rooms', 1);

        if ($totalRoomsSum < $minRoomsSetting) {
            return response()->json([
                'success' => false,
                'message' => "Le nombre minimum de chambres requis pour une réservation est de {$minRoomsSetting}.",
            ], 422);
        }
        
        // Calculate Global Info (Min Arrivee, Max Depart, Sum Personnes)
        $globalArrivee = collect($groups)->min('date_arrivee');
        $globalDepart  = collect($groups)->max('date_depart');
        $totalPersonnes = collect($groups)->sum(function ($g) {
            return collect($g['items'])->sum(function ($item) {
                return (($item['nb_adultes'] ?? 0) + ($item['nb_enfants'] ?? 0))
                      * ($item['quantite'] ?? 1);
            });
        });
        
        // Calculate total price from groups server-side for security
        $pricingResult = $this->calculateTotalPriceFromGroups(
            $groups, 
            (int) $validated['id_hotel'], 
            $validated['client_type']
        );

        $prixTotalCalculated = $pricingResult['total_price'];
        $decoratedGroups     = $pricingResult['groups'];

        // If client is a group, agency fields must be cleared
        if (($validated['client_type'] ?? null) === 'groupe') {
            $validated['code_agence'] = null;
            $validated['nom_agence']  = null;
        }

        // Prepare reservation data
        $reservationData = array_merge($validated, [
            'date_arrivee' => $globalArrivee,
            'date_depart'  => $globalDepart,
            'nb_personnes' => $totalPersonnes,
            'prix_total'   => $prixTotalCalculated,
        ]);
        unset($reservationData['groups']);

        $reservation = Reservation::create($reservationData);

        // Create Groups and their items
        foreach ($decoratedGroups as $groupData) {
            $items = $groupData['items'];
            // Keep calculated fields but remove nested items for the group create
            $groupFields = collect($groupData)->except(['items', 'final_price'])->toArray();
            
            // Calculate total pax for this group from items
            $groupNbPersonnes = collect($items)->sum(function($item) {
                return (
                    ($item['nb_adultes'] ?? 0) + 
                    ($item['nb_enfants'] ?? 0)
                ) * ($item['quantite'] ?? 1);
            });
            
            $groupFields['id_reservation'] = $reservation->id;
            $groupFields['nb_personnes'] = $groupNbPersonnes;
            $group = \App\Models\ReservationGroup::create($groupFields);
            
            foreach ($items as $itemData) {
                $itemData['id_reservation'] = $reservation->id;
                $itemData['id_group'] = $group->id;
                ItemReservation::create($itemData);
            }
        }

        $reservation->load(['hotel', 'groups.items.type', 'groups.items.capacity', 'details.type', 'details.capacity']);

        // Notify client about the new reservation
        try {
            Mail::to($reservation->email)
                ->send(new \App\Mail\ReservationStatusUpdated($reservation, 'en_attente'));
        } catch (\Throwable $e) {
            Log::error('Failed to send initial reservation email', [
                'reservation_id' => $reservation->id,
                'error'          => $e->getMessage(),
            ]);
        }

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
        $reservation = Reservation::with(['hotel', 'groups.items.type', 'groups.items.capacity', 'groups.discount', 'details.type', 'details.capacity', 'payments'])->find($id);

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
            'client_type'         => 'sometimes|required|string|in:agence,groupe',
            'nom_agence'          => 'nullable|string|max:255',
            'nom_contact'         => 'sometimes|required|string|max:255',
            'code_agence'         => 'required_if:client_type,agence|nullable|string|max:100',
            'email'               => 'sometimes|required|email|max:255',
            'telephone'           => 'sometimes|required|string|max:30',
            'id_hotel'            => 'sometimes|required|integer|exists:hotels,id',
            'remarques_speciales' => 'nullable|string',
            'statut'              => 'nullable|string|in:en_attente,en_verification,valide,en_attente_paiement,paye_partiellement,confirme,annule',
            'lien_paiement'       => 'nullable|string|max:2000',
            'groups'              => 'sometimes|required|array|min:1',
            'groups.*.date_arrivee' => 'required|date',
            'groups.*.date_depart'  => 'required|date|after:groups.*.date_arrivee',
            'groups.*.nb_personnes' => 'nullable|integer|min:0',
            'groups.*.items'        => 'required|array|min:1',
            'groups.*.items.*.id_type' => 'required|integer|exists:types,id',
            'groups.*.items.*.quantite' => 'required|integer|min:1',
            'groups.*.items.*.prix_unitaire' => 'required|numeric|min:0',
            'groups.*.items.*.nb_adultes'    => 'required|integer|min:0',
            'groups.*.items.*.nb_enfants'    => 'nullable|integer|min:0',
        ]);

        $groups = $validated['groups'] ?? null;
        $decoratedGroups = [];

        if ($groups) {
            // --- GLOBAL MIN ROOMS VALIDATION ---
            $totalRoomsSum = collect($groups)->sum(function($g) {
                return collect($g['items'])->sum('quantite');
            });
            $minRoomsSetting = (int) \App\Models\GlobalSetting::get('min_rooms', 1);

            if ($totalRoomsSum < $minRoomsSetting) {
                return response()->json([
                    'success' => false,
                    'message' => "Le nombre minimum de chambres requis est de {$minRoomsSetting}.",
                ], 422);
            }

            // Calculate Global Info
            $globalArrivee = collect($groups)->min('date_arrivee');
            $globalDepart  = collect($groups)->max('date_depart');
            $totalPersonnes = collect($groups)->sum(function ($g) {
                return collect($g['items'])->sum(function ($item) {
                    return (($item['nb_adultes'] ?? 0) + ($item['nb_enfants'] ?? 0))
                          * ($item['quantite'] ?? 1);
                });
            });
            
            // Calculate total price using helper server-side
            $pricingResult = $this->calculateTotalPriceFromGroups(
                $groups, 
                (int) ($validated['id_hotel'] ?? $reservation->id_hotel), 
                $validated['client_type'] ?? $reservation->client_type
            );

            $prixTotalCalculated = $pricingResult['total_price'];
            $decoratedGroups     = $pricingResult['groups'];

            $validated['date_arrivee'] = $globalArrivee;
            $validated['date_depart']  = $globalDepart;
            $validated['nb_personnes'] = $totalPersonnes;
            $validated['prix_total']   = $prixTotalCalculated;
        }

        // If client is a group, agency fields must be cleared
        if (($validated['client_type'] ?? $reservation->client_type) === 'groupe') {
            $validated['code_agence'] = null;
            $validated['nom_agence']  = null;
        }

        $reservation->update($validated);

        if ($groups) {
            // Delete old groups and items
            $reservation->groups()->each(function($group) {
                $group->items()->delete();
                $group->delete();
            });

            // Create new Groups and Items using pricing results
            foreach ($decoratedGroups as $groupData) {
                $items = $groupData['items'];
                // Keep calculated fields but remove nested items and final_price for the group create
                $groupFields = collect($groupData)->except(['items', 'final_price'])->toArray();
                
                // Calculate total pax for this group from items
                $groupNbPersonnes = collect($items)->sum(function($item) {
                    return (
                        ($item['nb_adultes'] ?? 0) + 
                        ($item['nb_enfants'] ?? 0)
                    ) * ($item['quantite'] ?? 1);
                });
                
                $groupFields['id_reservation'] = $reservation->id;
                $groupFields['nb_personnes'] = $groupNbPersonnes;
                $group = \App\Models\ReservationGroup::create($groupFields);
                
                foreach ($items as $itemData) {
                    $itemData['id_reservation'] = $reservation->id;
                    $itemData['id_group'] = $group->id;
                    ItemReservation::create($itemData);
                }
            }
        }

        $reservation->load(['hotel', 'groups.items.type', 'groups.items.capacity', 'details.type', 'details.capacity']);

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
            'statut' => 'required|string|in:en_attente,en_verification,valide,en_attente_paiement,paye_partiellement,confirme,annule',
        ]);


        // Capture old status before update
        $previousStatut = $reservation->statut;
        $newStatut      = $validated['statut'];

        // Strict Enforcement: Cannot move to payment without a link
        if ($newStatut === 'en_attente_paiement' && empty($reservation->lien_paiement)) {
            $msg = 'Veuillez d\'abord définir un lien de paiement pour cette réservation.';
            if ($request->wantsJson() && ! $request->header('X-Inertia')) {
                return response()->json(['success' => false, 'message' => $msg], 422);
            }
            return redirect()->back()->with('error', $msg);
        }

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
        ]);

        $updateData = array_filter($validated, fn($v) => $v !== null);

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
            'payment_date'    => 'required|date',
            'notes'           => 'nullable|string|max:500',
        ]);

        // 1. Calculate new total
        $currentPaid = (float) $reservation->montant_paye;
        $newAmount   = (float) $validated['montant'];
        $totalPaid   = $currentPaid + $newAmount;

        // 2. Check if total exceeds prix_total
        if ($totalPaid > $reservation->prix_total ) { 
            return redirect()->back()->with('error', 'Le montant total payé ne peut pas dépasser le prix total de la réservation.');
        }

        // 3. Upload new proof
        $path = $request->file('preuve_paiement')->store('proofs', 'public');

        // 4. Create Payment Record
        \App\Models\Payment::create([
            'id_reservation' => $reservation->id,
            'amount'         => $newAmount,
            'payment_date'   => $validated['payment_date'],
            'proof_path'     => $path,
            'provenance'     => 'admin',
            'notes'          => $validated['notes'],
            'is_verified'    => true,
            'status'         => 'verified',
            'verified_at'    => now(),
            'verified_by'    => auth()->id(),
        ]);

        // 5. Update Reservation (Sync cached amount and status)
        $previousStatut = $reservation->statut;
        $statut = $reservation->statut;

        if (abs($totalPaid - $reservation->prix_total) < 0.01) {
            $statut = 'confirme';
        } elseif ($totalPaid > 0) {
            $statut = 'paye_partiellement';
        }

        $reservation->update([
            'montant_paye'    => $totalPaid,
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

    /**
     * Public: Verify reservation via encrypted token.
     */
    public function publicVerify(string $reference): InertiaResponse|RedirectResponse
    {
        $reservation = $this->getReservationFromReference($reference);

        if (!$reservation) {
            return redirect()->route('booking')->with('error', 'Réservation introuvable ou lien expiré.');
        }

        // Load necessary relations including available tarifs/types for modification
        $reservation->load(['hotel.tarifs.type', 'hotel.tarifs.capacity', 'groups.items.type', 'groups.items.capacity', 'details.type', 'details.capacity']);

        return Inertia::render('Booking/Verify', [
            'reservation' => $reservation->load(['payments' => function($q) {
                $q->orderBy('created_at', 'desc');
            }]),
            'token'       => $reference,
            'confirm_url' => URL::signedRoute('booking.confirm', ['reference' => $reference]),
            'update_url'  => URL::signedRoute('booking.update',  ['reference' => $reference]),
            'payment_url' => URL::signedRoute('booking.addPayment', ['reference' => $reference]),
        ]);
    }

    /**
     * Public: Client uploads a payment proof.
     */
    public function publicAddPayment(Request $request, string $reference): RedirectResponse
    {
        $reservation = $this->getReservationFromReference($reference);
        if (!$reservation) {
            return redirect()->back()->with('error', 'Action impossible.');
        }

        $validated = $request->validate([
            'amount'          => 'required|numeric|min:1',
            'preuve_paiement' => 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:8192',
            'notes'           => 'nullable|string|max:500',
        ]);

        $path = $request->file('preuve_paiement')->store('proofs', 'public');

        Payment::create([
            'id_reservation' => $reservation->id,
            'amount'         => $validated['amount'],
            'payment_date'   => now(),
            'proof_path'     => $path,
            'provenance'     => 'client',
            'notes'          => $validated['notes'],
            'is_verified'    => false,
            'status'         => 'pending',
        ]);

        return redirect()->back()->with('success', 'Votre preuve de paiement a été soumise avec succès. Elle sera vérifiée par notre équipe très prochainement.');
    }

    /**
     * Admin: Verify and accept a payment.
     */
    public function verifyPayment(Request $request, string $id): RedirectResponse
    {
        $payment = Payment::with('reservation')->findOrFail($id);
        $reservation = $payment->reservation;

        if ($payment->status === 'verified') {
            return redirect()->back()->with('error', 'Ce paiement est déjà validé.');
        }

        // 1. Update Payment
        $payment->update([
            'is_verified' => true,
            'status'      => 'verified',
            'verified_at' => now(),
            'verified_by' => auth()->id(),
        ]);

        // 2. Recalculate Reservation total paid
        $totalPaid = $reservation->payments()->where('status', 'verified')->sum('amount');
        
        // 3. Update Reservation Status
        $previousStatut = $reservation->statut;
        $statut = $reservation->statut;

        if (abs($totalPaid - $reservation->prix_total) < 0.01) {
            $statut = 'confirme';
        } elseif ($totalPaid > 0) {
            $statut = 'paye_partiellement';
        }

        $reservation->update([
            'montant_paye'    => $totalPaid,
            'statut'          => $statut,
        ]);

        // 4. Notify Client
        try {
            $verifyUrl = URL::signedRoute('booking.verify', ['reference' => $reservation->code_reference]);
            Mail::to($reservation->email)->send(new PaymentVerified($reservation, $payment, $verifyUrl));
            
            if ($statut === 'confirme' && $previousStatut !== 'confirme') {
                Mail::to($reservation->email)->send(new ReservationStatusUpdated($reservation, $previousStatut));
            }
        } catch (\Throwable $e) {
            Log::error('Mailing error during payment verification', ['error' => $e->getMessage()]);
        }

        return redirect()->back()->with('success', 'Paiement validé et crédité au dossier.');
    }

    /**
     * Admin: Reject a payment.
     */
    public function rejectPayment(Request $request, string $id): RedirectResponse
    {
        $payment = Payment::with('reservation')->findOrFail($id);
        $reservation = $payment->reservation;

        $validated = $request->validate([
            'notes_admin' => 'required|string|max:500',
        ]);

        $payment->update([
            'is_verified' => false,
            'status'      => 'rejected',
            'notes_admin' => $validated['notes_admin'],
            'verified_at' => now(),
            'verified_by' => auth()->id(),
        ]);

        try {
            $verifyUrl = URL::signedRoute('booking.verify', ['reference' => $reservation->code_reference]);
            Mail::to($reservation->email)->send(new PaymentRejected($reservation, $payment, $verifyUrl));
        } catch (\Throwable $e) {
            Log::error('Mailing error during payment rejection', ['error' => $e->getMessage()]);
        }

        return redirect()->back()->with('success', 'Paiement rejeté et client notifié.');
    }

    /**
     * Public: Client confirms the reservation as is.
     */
    public function publicConfirm(string $reference): RedirectResponse
    {
        $reservation = $this->getReservationFromReference($reference);

        if (!$reservation) {
            return redirect()->route('booking')->with('error', 'Action impossible.');
        }

        if ($reservation->statut !== 'en_verification') {
            return redirect()->back()->with('error', 'Cette réservation ne peut plus être confirmée.');
        }

        $reservation->update(['statut' => 'valide']);

        return redirect()->back()->with('success', 'Votre réservation a été validée avec succès. Nous vous contacterons bientôt pour le paiement.');
    }

    /**
     * Public: Client modifies the reservation.
     */
    public function publicUpdate(Request $request, string $reference): JsonResponse|RedirectResponse
    {
        $reservation = $this->getReservationFromReference($reference);

        if (!$reservation) {
            return response()->json(['success' => false, 'message' => 'Réservation introuvable.'], 404);
        }

        $validated = $request->validate([
            'groups'                  => 'required|array|min:1',
            'groups.*.date_arrivee'   => 'required|date',
            'groups.*.date_depart'    => 'required|date|after:groups.*.date_arrivee',
            'groups.*.nb_personnes'   => 'nullable|integer|min:0',
            'groups.*.items'                  => 'required|array|min:1',
            'groups.*.items.*.id_type'        => 'required|integer|exists:types,id',
            'groups.*.items.*.id_capacity'    => 'required|integer|exists:hotel_type_capacities,id',
            'groups.*.items.*.quantite'       => 'required|integer|min:1',
            'groups.*.items.*.prix_unitaire'  => 'required|numeric|min:0',
            'groups.*.items.*.nb_adultes'     => 'required|integer|min:0',
            'groups.*.items.*.nb_enfants'     => 'nullable|integer|min:0',
        ]);

        // Custom Occupancy Validation
        foreach ($validated['groups'] as $gIdx => $group) {
            foreach ($group['items'] as $iIdx => $item) {
                $capacity = \App\Models\HotelTypeCapacity::find($item['id_capacity'] ?? null);
                if ($capacity) {
                    $totalPax = ($item['nb_adultes'] ?? 0) + ($item['nb_enfants'] ?? 0);
                    $maxTotal = $capacity->capacite_totale ?: ($capacity->capacite_adultes + $capacity->capacite_enfants);
                    
                    if ($totalPax > $maxTotal) {
                        return response()->json([
                            'success' => false,
                            'message' => "La configuration \"{$capacity->label}\" ne peut pas dépasser {$maxTotal} personnes (Adultes + Enfants).",
                        ], 422);
                    }
                }
            }
        }

        $groups = $validated['groups'];

        // --- GLOBAL MIN ROOMS VALIDATION ---
        $totalRoomsSum = collect($groups)->sum(function($g) {
            return collect($g['items'])->sum('quantite');
        });
        $minRoomsSetting = (int) \App\Models\GlobalSetting::get('min_rooms', 1);

        if ($totalRoomsSum < $minRoomsSetting) {
            return response()->json([
                'success' => false,
                'message' => "Le nombre minimum de chambres requis est de {$minRoomsSetting}.",
            ], 422);
        }

        // Recalculate price and global info using the new helper
        $pricingResult = $this->calculateTotalPriceFromGroups(
            $groups, 
            (int) $reservation->id_hotel, 
            $reservation->client_type
        );
        
        $prixTotalCalculated = $pricingResult['total_price'];
        $decoratedGroups     = $pricingResult['groups'];

        $globalArrivee = collect($groups)->min('date_arrivee');
        $globalDepart  = collect($groups)->max('date_depart');
        $totalPersonnes = collect($groups)->sum(function ($g) {
            return collect($g['items'])->sum(function ($item) {
                return (($item['nb_adultes'] ?? 0) + ($item['nb_enfants'] ?? 0))
                      * ($item['quantite'] ?? 1);
            });
        });

        // Update reservation
        $reservation->update([
            'date_arrivee' => $globalArrivee,
            'date_depart'  => $globalDepart,
            'nb_personnes' => $totalPersonnes,
            'prix_total'   => $prixTotalCalculated,
            'statut'       => 'en_attente', // Reset cycle
        ]);

        // Sync groups and items (Delete old ones)
        $reservation->groups()->each(function($group) {
            $group->items()->delete();
            $group->delete();
        });

        foreach ($decoratedGroups as $groupData) {
            $items = $groupData['items'];
            // Remove nested items and final_price for DB insertion
            $groupFields = collect($groupData)->except(['items', 'final_price'])->toArray();
            
            // Calculate total pax for this group from items
            $groupNbPersonnes = collect($items)->sum(function($item) {
                return (
                    ($item['nb_adultes'] ?? 0) + 
                    ($item['nb_enfants'] ?? 0)
                ) * ($item['quantite'] ?? 1);
            });
            
            $groupFields['id_reservation'] = $reservation->id;
            $groupFields['nb_personnes'] = $groupNbPersonnes;
            $group = \App\Models\ReservationGroup::create($groupFields);
            
            foreach ($items as $itemData) {
                $itemData['id_reservation'] = $reservation->id;
                $itemData['id_group'] = $group->id;
                ItemReservation::create($itemData);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Modifications enregistrées. Votre réservation est repassée en cours de traitement par l\'administrateur.',
            'redirect' => route('booking.verify', ['reference' => $reference])
        ]);
    }

    /**
     * Helper to decrypt token and find reservation.
     */
    private function getReservationFromReference(string $reference): ?Reservation
    {
        return Reservation::where('code_reference', $reference)->first();
    }

    /**
     * Helper to calculate total price from nested groups, applying best discount per group.
     */
    private function calculateTotalPriceFromGroups(array $groups, int $hotelId, string $clientType): array
    {
        $grandTotal = 0;
        $decoratedGroups = [];

        // Fetch hotel-specific percentages
        $hotel = \App\Models\Hotel::find($hotelId);
        if ($clientType === 'groupe') {
            $percentage = (float) ($hotel->group_price_percentage ?? 120);
        } else {
            $percentage = (float) ($hotel->agency_price_percentage ?? 100);
        }

        // Fetch active discounts for this specific hotel
        $allDiscounts = \App\Models\Discount::where('id_hotel', $hotelId)
            ->where('is_active', true)
            ->get();

        foreach ($groups as $group) {
            $nights  = $this->calculateNights($group['date_arrivee'], $group['date_depart']);
            $checkIn = $group['date_arrivee'];
            $totalRooms = collect($group['items'])->sum('quantite');

            $groupOriginalPrice = 0;

            foreach ($group['items'] as $item) {
                $tarif = \App\Models\Tarif::where('id_hotel', $hotelId)
                    ->where('id_capacity', $item['id_capacity'])
                    ->whereDate('date_debut', '<=', $checkIn)
                    ->whereDate('date_fin', '>=', $checkIn)
                    ->first();

                $rawPrix   = $tarif ? (float) $tarif->prix : 0;
                $finalPrix = round(($rawPrix * $percentage) / 100, 2);

                $groupOriginalPrice += (float) ($item['quantite'] * $finalPrix * $nights);
            }

            // --- Find BEST discount for this group ---
            $bestDiscountId = null;
            $bestDiscountAmount = 0;

            foreach ($allDiscounts as $discount) {
                $applies = false;
                if ($discount->condition_type === 'min_nights' && $nights >= $discount->condition_value) {
                    $applies = true;
                } elseif ($discount->condition_type === 'min_rooms' && $totalRooms >= $discount->condition_value) {
                    $applies = true;
                }

                if ($applies) {
                    $amount = 0;
                    if ($discount->type === 'percentage') {
                        $amount = ($groupOriginalPrice * $discount->value) / 100;
                    } else {
                        $amount = $discount->value;
                    }

                    if ($amount > $bestDiscountAmount) {
                        $bestDiscountAmount = $amount;
                        $bestDiscountId = $discount->id;
                    }
                }
            }

            $groupFinalPrice = round($groupOriginalPrice - $bestDiscountAmount, 2);
            $grandTotal += $groupFinalPrice;

            // Decorate group with calculation results
            $group['original_price']  = $groupOriginalPrice;
            $group['discount_amount'] = $bestDiscountAmount;
            $group['discount_id']     = $bestDiscountId;
            $group['final_price']     = $groupFinalPrice;

            $decoratedGroups[] = $group;
        }

        $taxAmount = 0;
        if ((float) $hotel->tax_percentage > 0) {
            $taxAmount = ($grandTotal * (float) $hotel->tax_percentage) / 100;
        }

        return [
            'total_price'  => (float) round($grandTotal + $taxAmount, 2),
            'tax_amount'   => (float) round($taxAmount, 2),
            'net_price'    => (float) round($grandTotal, 2),
            'groups'       => $decoratedGroups,
        ];
    }

    /**
     * Helper to calculate total price.
     */
    private function calculateTotalPrice(array $details, int $nights): float
    {
        $total = 0;
        foreach ($details as $detail) {
            $total += $detail['quantite'] * $detail['prix_unitaire'] * $nights;
        }
        return (float) $total;
    }

    /**
     * Helper to calculate nights.
     */
    private function calculateNights(string $dateArrivee, string $dateDepart): int
    {
        $checkIn = new \DateTime($dateArrivee);
        $checkOut = new \DateTime($dateDepart);
        return max(1, $checkOut->diff($checkIn)->days);
    }
}

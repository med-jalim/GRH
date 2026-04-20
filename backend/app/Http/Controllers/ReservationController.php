<?php

namespace App\Http\Controllers;

use App\Mail\PaymentRequired;
use App\Mail\ReservationCancelled;
use App\Mail\ReservationConfirmed;
use App\Mail\ReservationStatusUpdated;
use App\Mail\ReservationValidationRequest;
use App\Models\Hotel;
use App\Models\ItemReservation;
use App\Models\Reservation;
use App\Models\User;
use App\Notifications\AdminNotification;
use App\Services\ReservationService;
use Carbon\Carbon;
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
    protected $reservationService;

    public function __construct(ReservationService $reservationService)
    {
        $this->reservationService = $reservationService;
    }
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

        $query = $baseQuery->with(['hotel', 'groups.items.type', 'groups.items.subType'])
            ->orderByDesc('created_at');

        if ($request->view === 'calendar') {
            $reservations_data = $query->get();
            // To maintain consistency with the Paginated structure that Index.tsx expects, 
            // we wrap the collection in a similar object or handle it in Frontend.
            // However, Inertia expects 'reservations' prop to have 'data'.
            $reservations = [
                'data' => $reservations_data,
                'total' => $reservations_data->count(),
                'last_page' => 1,
                'current_page' => 1,
                'links' => [],
            ];
        } else {
            $reservations = $query->paginate(15);
        }

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
            'type_reservant'      => 'required|in:agence,groupe',
            'nom_agence'          => 'nullable|string|max:255',
            'code_agence'         => 'nullable|string|max:100',
            'nom_contact'         => 'required|string|max:255',
            'email'               => 'required|email|max:255',
            'telephone'           => 'required|string|max:30',
            'id_hotel'            => 'required|integer|exists:hotels,id',
            'remarques_speciales' => 'nullable|string',
            'statut'              => 'nullable|string|in:en_attente,confirme,annule',

            // Multi-group structure
            'groups'                         => 'required|array|min:1',
            'groups.*.date_arrivee'          => 'required|date',
            'groups.*.date_depart'           => 'required|date|after:groups.*.date_arrivee',
            'groups.*.nb_personnes'          => 'required|integer|min:1',
            'groups.*.rooms'                 => 'required|array|min:1',
            'groups.*.rooms.*.id_type'       => 'required|integer|exists:types,id',
            'groups.*.rooms.*.id_sub_type'   => 'required|integer|exists:sub_types,id',
            'groups.*.rooms.*.quantite'      => 'required|integer|min:1',
            'groups.*.rooms.*.prix_unitaire' => 'required|numeric|min:0',
            'groups.*.rooms.*.nb_adultes'    => 'required|integer|min:0',
            'groups.*.rooms.*.nb_enfants'    => 'required|integer|min:0',
        ]);

        // Occupancy validation
        $occupancyFailures = $this->reservationService->validateOccupancyCount($validated['groups']);
        if (!empty($occupancyFailures)) {
            return response()->json([
                'success' => false,
                'message' => "La capacité maximale d'une ou plusieurs chambres a été dépassée.",
                'errors'  => $occupancyFailures
            ], 422);
        }

        // Availability check
        $failures = $this->reservationService->checkAvailability($validated['id_hotel'], $validated['groups']);
        if (!empty($failures)) {
            return response()->json([
                'success' => false,
                'message' => 'Certains articles ne sont pas disponibles.',
                'errors'  => $failures
            ], 422);
        }

        // Minimum rooms validation
        $minRoomsSetting = \App\Models\AppSetting::where('key', 'min_rooms_per_reservation')->first();
        $minRooms = $minRoomsSetting ? (int)$minRoomsSetting->value : 11;
        
        $totalRooms = collect($validated['groups'])->flatMap(function ($group) {
            return $group['rooms'];
        })->sum('quantite');

        if ($totalRooms < $minRooms) {
            $errorMessage = "Une réservation doit comporter au moins $minRooms chambres.";
            if ($request->wantsJson() && ! $request->header('X-Inertia')) {
                return response()->json([
                    'success' => false,
                    'message' => $errorMessage,
                    'errors'  => ['rooms' => [$errorMessage]]
                ], 422);
            }
            return redirect()->back()->withErrors(['rooms' => $errorMessage])->withInput();
        }

        // Auto-generate a unique reference code
        $validated['code_reference'] = 'RES-' . strtoupper(Str::random(8));
        $validated['statut']         = $validated['statut'] ?? 'en_attente';

        $groupsData = $validated['groups'];
        $chambreSousTotal = 0;
        $taxeSejourTotal = 0;
        $totalPersonnes = 0;

        $hotel = Hotel::find($validated['id_hotel']);
        $taxeParAdulte = $hotel->taxe_sejour ?? 0;

        // Ratio handling (Phase 1)
        $ratio = 1.0;
        if ($validated['type_reservant'] === 'agence') {
            $ratio = (float)($hotel->agency_ratio ?? 0.96);
        } elseif ($validated['type_reservant'] === 'groupe') {
            $ratio = (float)($hotel->group_ratio ?? 1.00);
        }

        foreach ($groupsData as $g) {
            $nights = $this->reservationService->calculateNights($g['date_arrivee'], $g['date_depart']);
            $groupPersonnes = collect($g['rooms'])->sum(function ($room) {
                return ((int) ($room['nb_adultes'] ?? 0)) + ((int) ($room['nb_enfants'] ?? 0));
            });
            $totalPersonnes += $groupPersonnes;

            foreach ($g['rooms'] as &$r) {
                // Ensure price is rounded after applying ratio (if ratio is applied here or previously)
                // For safety, we trust the prix_unitaire sent but we want to ensure it reflects the ROUNDED Phase 1 price.
                
                $chambreSousTotal += ($r['quantite'] * round($r['prix_unitaire']) * $nights);
                
                // Tax Calculation (Daily per adult)
                $taxeSejourTotal += ($r['nb_adultes'] * $r['quantite'] * $nights * $taxeParAdulte);
            }
        }

        $validated['nb_personnes'] = $totalPersonnes;
        $validated['taxe_sejour_total'] = $taxeSejourTotal;

        // Calculate total nights for tiered discount
        $totalNights = 0;
        foreach ($groupsData as $g) {
            $totalNights += $this->reservationService->calculateNights($g['date_arrivee'], $g['date_depart']);
        }

        // Apply Dynamic Discount
        $discountData = $this->calculateDiscount($totalNights, $chambreSousTotal, $taxeSejourTotal);
        $validated['prix_total'] = $discountData['prix_total'];
        $validated['prix_avant_remise'] = $discountData['prix_avant_remise'];
        $validated['remise_pourcentage'] = $discountData['remise_pourcentage'];

        unset($validated['groups']);
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

        // Create groups and line items
        foreach ($groupsData as $groupData) {
            $groupOccupants = collect($groupData['rooms'])->sum(function ($room) {
                return ((int) ($room['nb_adultes'] ?? 0)) + ((int) ($room['nb_enfants'] ?? 0));
            });

            $group = \App\Models\ReservationGroup::create([
                'id_reservation' => $reservation->id,
                'date_arrivee'   => $groupData['date_arrivee'],
                'date_depart'    => $groupData['date_depart'],
                'nb_personnes'   => $groupOccupants,
            ]);

            foreach ($groupData['rooms'] as $roomData) {
                ItemReservation::create([
                    'id_group'      => $group->id,
                    'id_type'       => $roomData['id_type'],
                    'id_sub_type'   => $roomData['id_sub_type'],
                    'quantite'      => $roomData['quantite'],
                    'prix_unitaire' => $roomData['prix_unitaire'],
                    'nb_adultes'    => $roomData['nb_adultes'],
                    'nb_enfants'    => $roomData['nb_enfants'],
                ]);
            }
        }

        $reservation->load(['hotel', 'groups.items.type', 'groups.items.subType']);

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
     * Check availability via AJAX for real-time feedback.
     */
    public function checkAvailabilityAjax(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_hotel' => 'required|integer|exists:hotels,id',
            'groups'   => 'required|array',
            'reservation_id' => 'nullable|integer|exists:reservations,id'
        ]);

        $results = $this->reservationService->checkDetailedAvailability(
            $validated['id_hotel'], 
            $validated['groups'],
            $validated['reservation_id'] ?? null
        );

        return response()->json([
            'success' => true,
            'availability' => $results
        ]);
    }

    /**
     * Display the specified reservation with all details.
     */
    public function show(string $id): InertiaResponse|JsonResponse|RedirectResponse
    {
        $reservation = Reservation::with(['hotel', 'groups.items.type', 'groups.items.subType', 'payments'])->find($id);

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
            'type_reservant'      => 'sometimes|required|in:agence,groupe',
            'nom_agence'          => 'nullable|string|max:255',
            'nom_contact'         => 'sometimes|required|string|max:255',
            'code_agence'         => 'nullable|string|max:100',
            'email'               => 'sometimes|required|email|max:255',
            'telephone'           => 'sometimes|required|string|max:30',
            'id_hotel'            => 'sometimes|required|integer|exists:hotels,id',
            'remarques_speciales' => 'nullable|string',
            'statut'              => 'nullable|string|in:en_attente,confirme,annule',
            'prix_total'          => 'sometimes|numeric|min:0',
            'nb_personnes'        => 'sometimes|integer|min:1',
        ]);

        $reservation->update($validated);

        // Recalculate total if general info changed (hotel, etc.)
        $chambreSousTotal = 0;
        $taxeSejourTotal = 0;
        $totalPersonnes = 0;

        $hotel = $reservation->hotel;
        $taxeParAdulte = $hotel->taxe_sejour ?? 0;

        foreach ($reservation->groups as $group) {
            $nights = $this->reservationService->calculateNights($group->date_arrivee, $group->date_depart);
            $totalPersonnes += $group->items->sum(function ($item) {
                return ((int) ($item->nb_adultes ?? 0)) + ((int) ($item->nb_enfants ?? 0));
            });
            foreach ($group->items as $item) {
                // Room Price
                $chambreSousTotal += ($item->quantite * $item->prix_unitaire * $nights);
                
                // Tax Calculation
                $taxeSejourTotal += ($item->nb_adultes * $item->quantite * $nights * $taxeParAdulte);
            }
        }

        $typeReservant = $validated['type_reservant'] ?? $reservation->type_reservant;
        $reservation->taxe_sejour_total = $taxeSejourTotal;
        
        // Calculate total nights for tiered discount
        $totalNights = 0;
        foreach ($reservation->groups as $group) {
            $totalNights += $this->reservationService->calculateNights($group->date_arrivee, $group->date_depart);
        }

        // Apply Dynamic Discount
        $discountData = $this->calculateDiscount($totalNights, $chambreSousTotal, $taxeSejourTotal);
        $reservation->prix_total = $discountData['prix_total'];
        $reservation->prix_avant_remise = $discountData['prix_avant_remise'];
        $reservation->remise_pourcentage = $discountData['remise_pourcentage'];

        $reservation->nb_personnes = $totalPersonnes;
        $reservation->save();

        $reservation->load(['hotel', 'groups.items.type', 'groups.items.subType']);

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

        // Delete groups first (line items will cascade delete if schema is correct, or we do it manually)
        foreach ($reservation->groups as $group) {
            $group->items()->delete();
            $group->delete();
        }
        $reservation->delete();

        if (request()->wantsJson() && ! request()->header('X-Inertia')) {
            return $this->sendResponse(null, 'Réservation supprimée avec succès.');
        }

        return redirect()->route('admin.reservations.index')->with('success', 'Réservation supprimée avec succès.');
    }

    /**
     * Calculate discount based on total nights and tiered rules.
     */
    private function calculateDiscount(int $totalNights, float $chambreSousTotal, float $taxeSejourTotal): array
    {
        $applicableDiscount = 0;
        
        // Find the highest applicable tiered discount
        $tierRule = \App\Models\DiscountRule::where('min_nights', '<=', $totalNights)
            ->orderByDesc('min_nights')
            ->first();
            
        if ($tierRule) {
            $applicableDiscount = (float) $tierRule->discount_percentage;
        }

        if ($applicableDiscount > 0) {
            return [
                'prix_avant_remise'  => $chambreSousTotal,
                'remise_pourcentage' => $applicableDiscount,
                'prix_total'         => ($chambreSousTotal * (1 - ($applicableDiscount / 100))) + $taxeSejourTotal,
            ];
        }

        return [
            'prix_avant_remise'  => null,
            'remise_pourcentage' => null,
            'prix_total'         => $chambreSousTotal + $taxeSejourTotal,
        ];
    }
}

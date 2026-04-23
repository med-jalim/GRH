<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use App\Models\Type;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HotelController extends Controller
{
    public function getAdjustedTarifs(Request $request, Hotel $hotel): JsonResponse
    {
        $clientType = $request->query('client_type', 'agence');
        $tarifs = $hotel->tarifs()->with('capacity')->get();

        if ($clientType === 'groupe') {
            $percentage = (float) ($hotel->group_price_percentage ?? 120);
        } else {
            $percentage = (float) ($hotel->agency_price_percentage ?? 100);
        }

        if ($percentage !== 100.0) {
            $tarifs->each(function ($tarif) use ($percentage) {
                $tarif->raw_prix = $tarif->prix;
                $tarif->prix = round(($tarif->prix * $percentage) / 100, 2);
            });
        }

        return response()->json([
            'success'    => true,
            'tarifs'     => $tarifs,
            'percentage' => $percentage,
        ]);
    }

    /**
     * Display the booking form page (public).
     */
    public function bookingPage(): Response
    {
        $hotels = Hotel::with(['chambres.type', 'tarifs.capacity', 'typeCapacities', 'discounts' => fn($q) => $q->where('is_active', true)])->get();
        $types  = Type::all();
        
        $settings = [
            'min_rooms' => (int) \App\Models\GlobalSetting::get('min_rooms', 1),
        ];

        return Inertia::render('BookingFormPage', [
            'hotels'    => $hotels,
            'types'     => $types,
            'settings'  => $settings,
        ]);
    }

    /**
     * Admin: list all hotels with counts.
     */
    public function index(Request $request): Response|JsonResponse
    {
        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return $this->sendResponse(
                Hotel::with('chambres.type', 'tarifs.type')->get(),
                'Liste des hôtels récupérée avec succès.'
            );
        }

        $hotels = Hotel::withCount(['chambres', 'reservations'])
            ->with(['tarifs.type'])
            ->orderBy('name')
            ->get();

        $stats = [
            'total'       => $hotels->count(),
            'villes'      => $hotels->pluck('ville')->filter()->unique()->count(),
            'chambres'    => $hotels->sum('chambres_count'),
            'reservations'=> $hotels->sum('reservations_count'),
        ];

        return Inertia::render('Admin/Hotels/Index', [
            'hotels' => $hotels,
            'stats'  => $stats,
        ]);
    }

    /**
     * Admin: store a new hotel.
     */
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'name'                      => 'required|string|max:255',
            'ville'                     => 'nullable|string|max:255',
            'stars'                     => 'nullable|integer|min:1|max:5',
            'description'               => 'nullable|string',
            'telephone'                 => 'nullable|string|max:20',
            'email'                     => 'nullable|email|max:255',
            'adresse'                   => 'nullable|string|max:1000',
            'rib'                       => 'nullable|digits:24',
            'agency_price_percentage'   => 'nullable|numeric|min:0|max:999',
            'group_price_percentage'    => 'nullable|numeric|min:0|max:999',
            'tax_percentage'            => 'nullable|numeric|min:0|max:100',
        ]);

        $hotel = Hotel::create($validated);

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return $this->sendResponse($hotel, 'Hôtel créé avec succès.', 201);
        }

        return redirect()->route('admin.hotels.index')
            ->with('success', "L'hôtel \"{$hotel->name}\" a été créé avec succès.");
    }

    /**
     * Admin: show one hotel in detail.
     */
    public function show(Request $request, string $id): Response|JsonResponse|RedirectResponse
    {
        $hotel = Hotel::with([
            'mainType',
            'pricingRules.type',
            'chambres.type',
            // 'tarifs.type',
            'tarifs.capacity',
            'typeCapacities',
            'discounts' => fn ($q) => $q->orderByDesc('created_at'),
            'reservations' => fn ($q) => $q->orderByDesc('created_at')->limit(10),
        ])->find($id);

        if (! $hotel) {
            if ($request->wantsJson() && ! $request->header('X-Inertia')) {
                return $this->sendError('Hôtel introuvable.');
            }
            return redirect()->route('admin.hotels.index')
                ->with('error', 'Hôtel introuvable.');
        }

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return $this->sendResponse($hotel, 'Hôtel récupéré avec succès.');
        }

        $types = Type::orderBy('nom')->get();

        return Inertia::render('Admin/Hotels/Show', [
            'hotel' => $hotel,
            'types' => $types,
        ]);
    }

    /**
     * Admin: update a hotel's pricing rules.
     */
    public function updatePricingRules(Request $request, Hotel $hotel): RedirectResponse
    {
        $validated = $request->validate([
            'main_type_id' => 'required|exists:types,id',
            'rules'        => 'required|array',
            'rules.*.id_type'    => 'required|exists:types,id',
            'rules.*.percentage' => 'required|numeric|min:0',
        ]);

        $hotel->update(['main_type_id' => $validated['main_type_id']]);

        foreach ($validated['rules'] as $ruleData) {
            $hotel->pricingRules()->updateOrCreate(
                ['id_type' => $ruleData['id_type']],
                ['percentage' => $ruleData['percentage']]
            );
        }

        return back()->with('success', 'Configuration des prix mise à jour avec succès.');
    }

    /**
     * Admin: update a hotel's type capacities (Mass update - legacy/fallback).
     */
    public function updateTypeCapacities(Request $request, Hotel $hotel): RedirectResponse
    {
        $validated = $request->validate([
            'capacities'                    => 'required|array',
            'capacities.*.id'               => 'nullable|integer|exists:hotel_type_capacities,id',
            'capacities.*.id_type'          => 'required|integer|exists:types,id',
            'capacities.*.label'            => 'nullable|string|max:255',
            'capacities.*.capacite_adultes' => 'required|integer|min:0',
            'capacities.*.capacite_enfants' => 'required|integer|min:0',
            'capacities.*.capacite_totale'  => 'nullable|integer|min:0',
        ]);

        $incomingIds = collect($validated['capacities'])->pluck('id')->filter()->toArray();

        // Delete removed configurations for this hotel
        $hotel->typeCapacities()->whereNotIn('id', $incomingIds)->delete();

        foreach ($validated['capacities'] as $cap) {
            $data = [
                'id_type'          => (int) $cap['id_type'],
                'label'            => $cap['label'],
                'capacite_adultes' => (int) $cap['capacite_adultes'],
                'capacite_enfants' => (int) $cap['capacite_enfants'],
                'capacite_totale'  => isset($cap['capacite_totale']) ? (int) $cap['capacite_totale'] : null,
            ];

            if (isset($cap['id']) && !empty($cap['id'])) {
                $hotel->typeCapacities()->where('id', $cap['id'])->update($data);
            } else {
                $hotel->typeCapacities()->create($data);
            }
        }

        return back()->with('success', 'Capacités mises à jour avec succès.');
    }

    /**
     * Admin: Store a single type capacity configuration.
     */
    public function storeTypeCapacity(Request $request, Hotel $hotel): RedirectResponse
    {
        $validated = $request->validate([
            'id_type'          => 'required|integer|exists:types,id',
            'label'            => 'required|string|max:255',
            'capacite_adultes' => 'required|integer|min:0',
            'capacite_enfants' => 'required|integer|min:0',
            'capacite_totale'  => 'nullable|integer|min:0',
        ]);

        $hotel->typeCapacities()->create($validated);

        return back()->with('success', 'Configuration ajoutée avec succès.');
    }

    /**
     * Admin: Update a single type capacity configuration.
     */
    public function updateTypeCapacityIndividual(Request $request, Hotel $hotel, $capacityId): RedirectResponse
    {
        $validated = $request->validate([
            'label'            => 'required|string|max:255',
            'capacite_adultes' => 'required|integer|min:0',
            'capacite_enfants' => 'required|integer|min:0',
            'capacite_totale'  => 'nullable|integer|min:0',
        ]);

        $hotel->typeCapacities()->where('id', $capacityId)->update($validated);

        return back()->with('success', 'Configuration mise à jour avec succès.');
    }

    /**
     * Admin: Delete a single type capacity configuration.
     */
    public function deleteTypeCapacity(Request $request, Hotel $hotel, $capacityId): RedirectResponse
    {
        $hotel->typeCapacities()->where('id', $capacityId)->delete();

        return back()->with('success', 'Configuration supprimée avec succès.');
    }

    /**
     * Admin: update a hotel.
     */
    public function update(Request $request, string $id): RedirectResponse|JsonResponse
    {
        $hotel = Hotel::find($id);

        if (! $hotel) {
            if ($request->wantsJson() && ! $request->header('X-Inertia')) {
                return $this->sendError('Hôtel introuvable.');
            }
            return redirect()->route('admin.hotels.index')
                ->with('error', 'Hôtel introuvable.');
        }

        $validated = $request->validate([
            'name'                      => 'sometimes|required|string|max:255',
            'ville'                     => 'nullable|string|max:255',
            'stars'                     => 'nullable|integer|min:1|max:5',
            'description'               => 'nullable|string',
            'telephone'                 => 'nullable|string|max:20',
            'email'                     => 'nullable|email|max:255',
            'adresse'                   => 'nullable|string|max:1000',
            'rib'                       => 'nullable|digits:24',
            'agency_price_percentage'   => 'nullable|numeric|min:0|max:999',
            'group_price_percentage'    => 'nullable|numeric|min:0|max:999',
            'tax_percentage'            => 'nullable|numeric|min:0|max:100',
        ]);

        $hotel->update($validated);

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return $this->sendResponse($hotel, 'Hôtel mis à jour avec succès.');
        }

        return redirect()->route('admin.hotels.show', $hotel->id)
            ->with('success', 'Hôtel mis à jour avec succès.');
    }

    /**
     * Admin: delete a hotel.
     */
    public function destroy(Request $request, string $id): RedirectResponse|JsonResponse
    {
        $hotel = Hotel::find($id);

        if (! $hotel) {
            if ($request->wantsJson() && ! $request->header('X-Inertia')) {
                return $this->sendError('Hôtel introuvable.');
            }
            return redirect()->route('admin.hotels.index')
                ->with('error', 'Hôtel introuvable.');
        }

        $hotel->delete();

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return $this->sendResponse(null, 'Hôtel supprimé avec succès.');
        }

        return redirect()->route('admin.hotels.index')
            ->with('success', 'Hôtel supprimé avec succès.');
    }
    // --- DISCOUNTS (REMISES) ---

    public function storeDiscount(Request $request, Hotel $hotel)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'type'            => 'required|in:percentage,fixed',
            'value'           => 'required|numeric|min:0',
            'condition_type'  => 'required|in:min_nights,min_rooms',
            'condition_value' => 'required|integer|min:1',
            'is_active'       => 'boolean',
        ]);

        $hotel->discounts()->create($validated);

        return back()->with('success', 'Règle de remise ajoutée.');
    }

    public function updateDiscount(Request $request, Hotel $hotel, \App\Models\Discount $discount)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'type'            => 'required|in:percentage,fixed',
            'value'           => 'required|numeric|min:0',
            'condition_type'  => 'required|in:min_nights,min_rooms',
            'condition_value' => 'required|integer|min:1',
            'is_active'       => 'boolean',
        ]);

        $discount->update($validated);

        return back()->with('success', 'Remise mise à jour.');
    }

    public function toggleDiscount(Hotel $hotel, \App\Models\Discount $discount)
    {
        $discount->update(['is_active' => !$discount->is_active]);
        return back();
    }

    public function deleteDiscount(Hotel $hotel, \App\Models\Discount $discount)
    {
        $discount->delete();
        return back()->with('success', 'Remise supprimée.');
    }
}

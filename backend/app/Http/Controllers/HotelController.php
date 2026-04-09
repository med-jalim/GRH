<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use App\Models\HotelTypeTarification;
use App\Models\Type;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HotelController extends Controller
{
    /**
     * Display the booking form page (public).
     */
    public function bookingPage(): Response
    {
        $hotels = Hotel::withBookingData()->get();

        return Inertia::render('BookingFormPage', [
            'hotels' => $hotels,
        ]);
    }

    /**
     * Admin: list all hotels with counts.
     */
    public function index(Request $request): Response|JsonResponse
    {
        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return $this->sendResponse(
                Hotel::withBookingData()->get(),
                'Liste des hôtels récupérée avec succès.'
            );
        }

        $hotels = Hotel::withCount(['chambres', 'reservations'])
            ->withBookingData()
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
            'name'        => 'required|string|max:255',
            'ville'       => 'nullable|string|max:255',
            'stars'       => 'nullable|integer|min:1|max:5',
            'description' => 'nullable|string',
            'telephone'   => 'nullable|string|max:20',
            'email'       => 'nullable|email|max:255',
            'adresse'     => 'nullable|string|max:1000',
            'rib'         => 'nullable|string|min:10|max:24',
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
        $hotel = Hotel::withBookingData()
            ->with(['reservations' => fn ($q) => $q->orderByDesc('created_at')->limit(10)])
            ->find($id);

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

        $types = Type::with(['subTypes' => function($q) use ($id) {
            $q->where('id_hotel', $id)->with('occupancies');
        }])->orderBy('nom')->get();

        return Inertia::render('Admin/Hotels/Show', [
            'hotel'          => $hotel,
            'types'          => $types,
            'tarification'   => $hotel->typeTarifications->map(fn($t) => [
                'id_type'      => $t->id_type,
                'type_nom'     => $t->type?->nom,
                'is_essentiel' => $t->is_essentiel,
                'pourcentage'  => $t->pourcentage,
                'cap_adultes'  => $t->cap_adultes,
                'cap_enfants'  => $t->cap_enfants,
                'cap_bebes'    => $t->cap_bebes,
            ]),
        ]);
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
            'name'        => 'sometimes|required|string|max:255',
            'ville'       => 'nullable|string|max:255',
            'stars'       => 'nullable|integer|min:1|max:5',
            'description' => 'nullable|string',
            'telephone'   => 'nullable|string|max:20',
            'email'       => 'nullable|email|max:255',
            'adresse'     => 'nullable|string|max:1000',
            'rib'         => 'nullable|string|min:10|max:24',
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
}

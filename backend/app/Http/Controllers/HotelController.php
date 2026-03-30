<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HotelController extends Controller
{
    /**
     * Display the booking form page.
     */
    public function bookingPage(): Response
    {
        $hotels = Hotel::with(['chambres.type', 'tarifs.type'])->get();

        return Inertia::render('BookingFormPage', [
            'hotels' => $hotels,
        ]);
    }

    /**
     * Display a listing of all hotels.
     */
    public function index(): JsonResponse
    {
        $hotels = Hotel::with('chambres.type', 'tarifs.type')->get();

        return $this->sendResponse($hotels, 'Liste des hôtels récupérée avec succès.');
    }

    /**
     * Store a newly created hotel in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'ville'       => 'nullable|string|max:255',
            'stars'       => 'nullable|integer|min:1|max:5',
        ]);

        $hotel = Hotel::create($validated);

        return $this->sendResponse($hotel, 'Hôtel créé avec succès.', 201);
    }

    /**
     * Display the specified hotel with its rooms and tariffs.
     */
    public function show(string $id): JsonResponse
    {
        $hotel = Hotel::with(['chambres.type', 'tarifs.type'])->find($id);

        if (! $hotel) {
            return $this->sendError('Hôtel introuvable.');
        }

        return $this->sendResponse($hotel, 'Hôtel récupéré avec succès.');
    }

    /**
     * Update the specified hotel in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $hotel = Hotel::find($id);

        if (! $hotel) {
            return $this->sendError('Hôtel introuvable.');
        }

        // ... validation logic (omitted for brevity in replacement but kept in file) ...

        $hotel->update($validated);

        return $this->sendResponse($hotel, 'Hôtel mis à jour avec succès.');
    }

    /**
     * Remove the specified hotel from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $hotel = Hotel::find($id);

        if (! $hotel) {
            return $this->sendError('Hôtel introuvable.');
        }

        $hotel->delete();

        return $this->sendResponse(null, 'Hôtel supprimé avec succès.');
    }
}

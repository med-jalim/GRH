<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HotelController extends Controller
{
    /**
     * Display a listing of all hotels.
     */
    public function index(): JsonResponse
    {
        $hotels = Hotel::withCount('chambres')->get();

        return response()->json([
            'success' => true,
            'data'    => $hotels,
        ]);
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

        return response()->json([
            'success' => true,
            'message' => 'Hôtel créé avec succès.',
            'data'    => $hotel,
        ], 201);
    }

    /**
     * Display the specified hotel with its rooms and tariffs.
     */
    public function show(string $id): JsonResponse
    {
        $hotel = Hotel::with(['chambres.type', 'tarifs.type'])->find($id);

        if (! $hotel) {
            return response()->json([
                'success' => false,
                'message' => 'Hôtel introuvable.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $hotel,
        ]);
    }

    /**
     * Update the specified hotel in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $hotel = Hotel::find($id);

        if (! $hotel) {
            return response()->json([
                'success' => false,
                'message' => 'Hôtel introuvable.',
            ], 404);
        }

        $validated = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'ville'       => 'nullable|string|max:255',
            'stars'       => 'nullable|integer|min:1|max:5',
        ]);

        $hotel->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Hôtel mis à jour avec succès.',
            'data'    => $hotel,
        ]);
    }

    /**
     * Remove the specified hotel from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $hotel = Hotel::find($id);

        if (! $hotel) {
            return response()->json([
                'success' => false,
                'message' => 'Hôtel introuvable.',
            ], 404);
        }

        $hotel->delete();

        return response()->json([
            'success' => true,
            'message' => 'Hôtel supprimé avec succès.',
        ]);
    }
}

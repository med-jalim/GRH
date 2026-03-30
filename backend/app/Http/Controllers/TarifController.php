<?php

namespace App\Http\Controllers;

use App\Models\Tarif;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TarifController extends Controller
{
    /**
     * Display a listing of tariffs, optionally filtered by hotel or type.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Tarif::with(['hotel', 'type']);

        if ($request->has('id_hotel')) {
            $query->where('id_hotel', $request->id_hotel);
        }

        if ($request->has('id_type')) {
            $query->where('id_type', $request->id_type);
        }

        $tarifs = $query->orderBy('date_debut')->get();

        return response()->json([
            'success' => true,
            'data'    => $tarifs,
        ]);
    }

    /**
     * Store a newly created tariff.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_hotel'   => 'required|integer|exists:hotels,id',
            'id_type'    => 'required|integer|exists:types,id',
            'prix'       => 'required|numeric|min:0',
            'date_debut' => 'required|date',
            'date_fin'   => 'required|date|after_or_equal:date_debut',
        ]);

        $tarif = Tarif::create($validated);
        $tarif->load(['hotel', 'type']);

        return response()->json([
            'success' => true,
            'message' => 'Tarif créé avec succès.',
            'data'    => $tarif,
        ], 201);
    }

    /**
     * Display the specified tariff.
     */
    public function show(string $id): JsonResponse
    {
        $tarif = Tarif::with(['hotel', 'type'])->find($id);

        if (! $tarif) {
            return response()->json([
                'success' => false,
                'message' => 'Tarif introuvable.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $tarif,
        ]);
    }

    /**
     * Update the specified tariff.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tarif = Tarif::find($id);

        if (! $tarif) {
            return response()->json([
                'success' => false,
                'message' => 'Tarif introuvable.',
            ], 404);
        }

        $validated = $request->validate([
            'id_hotel'   => 'sometimes|required|integer|exists:hotels,id',
            'id_type'    => 'sometimes|required|integer|exists:types,id',
            'prix'       => 'sometimes|required|numeric|min:0',
            'date_debut' => 'sometimes|required|date',
            'date_fin'   => 'sometimes|required|date|after_or_equal:date_debut',
        ]);

        $tarif->update($validated);
        $tarif->load(['hotel', 'type']);

        return response()->json([
            'success' => true,
            'message' => 'Tarif mis à jour avec succès.',
            'data'    => $tarif,
        ]);
    }

    /**
     * Remove the specified tariff.
     */
    public function destroy(string $id): JsonResponse
    {
        $tarif = Tarif::find($id);

        if (! $tarif) {
            return response()->json([
                'success' => false,
                'message' => 'Tarif introuvable.',
            ], 404);
        }

        $tarif->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tarif supprimé avec succès.',
        ]);
    }
}

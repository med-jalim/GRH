<?php

namespace App\Http\Controllers;

use App\Models\Chambre;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChambreController extends Controller
{
    /**
     * Display a listing of all rooms, optionally filtered by hotel.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Chambre::with(['hotel', 'type']);

        if ($request->has('id_hotel')) {
            $query->where('id_hotel', $request->id_hotel);
        }

        $chambres = $query->get();

        return response()->json([
            'success' => true,
            'data'    => $chambres,
        ]);
    }

    /**
     * Store a newly created room in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'numero'   => 'required|string|max:50',
            'id_hotel' => 'required|integer|exists:hotels,id',
            'id_type'  => 'required|integer|exists:types,id',
        ]);

        $chambre = Chambre::create($validated);
        $chambre->load(['hotel', 'type']);

        return response()->json([
            'success' => true,
            'message' => 'Chambre créée avec succès.',
            'data'    => $chambre,
        ], 201);
    }

    /**
     * Display the specified room.
     */
    public function show(string $id): JsonResponse
    {
        $chambre = Chambre::with(['hotel', 'type'])->find($id);

        if (! $chambre) {
            return response()->json([
                'success' => false,
                'message' => 'Chambre introuvable.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $chambre,
        ]);
    }

    /**
     * Update the specified room in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $chambre = Chambre::find($id);

        if (! $chambre) {
            return response()->json([
                'success' => false,
                'message' => 'Chambre introuvable.',
            ], 404);
        }

        $validated = $request->validate([
            'numero'   => 'sometimes|required|string|max:50',
            'id_hotel' => 'sometimes|required|integer|exists:hotels,id',
            'id_type'  => 'sometimes|required|integer|exists:types,id',
        ]);

        $chambre->update($validated);
        $chambre->load(['hotel', 'type']);

        return response()->json([
            'success' => true,
            'message' => 'Chambre mise à jour avec succès.',
            'data'    => $chambre,
        ]);
    }

    /**
     * Remove the specified room from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $chambre = Chambre::find($id);

        if (! $chambre) {
            return response()->json([
                'success' => false,
                'message' => 'Chambre introuvable.',
            ], 404);
        }

        $chambre->delete();

        return response()->json([
            'success' => true,
            'message' => 'Chambre supprimée avec succès.',
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Type;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TypeController extends Controller
{
    /**
     * Display a listing of all room types.
     */
    public function index(): JsonResponse
    {
        $types = Type::withCount('chambres')->get();

        return $this->sendResponse($types, 'Liste des types de chambre récupérée avec succès.');
    }

    /**
     * Store a newly created room type.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom'         => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $type = Type::create($validated);

        return $this->sendResponse($type, 'Type créé avec succès.', 201);
    }

    /**
     * Display the specified room type with its rooms.
     */
    public function show(string $id): JsonResponse
    {
        $type = Type::with('chambres.hotel')->find($id);

        if (! $type) {
            return $this->sendError('Type introuvable.');
        }

        return $this->sendResponse($type, 'Type récupéré avec succès.');
    }

    /**
     * Update the specified room type.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $type = Type::find($id);

        if (! $type) {
            return response()->json([
                'success' => false,
                'message' => 'Type introuvable.',
            ], 404);
        }

        $validated = $request->validate([
            'nom'         => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $type->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Type mis à jour avec succès.',
            'data'    => $type,
        ]);
    }

    /**
     * Remove the specified room type.
     */
    public function destroy(string $id): JsonResponse
    {
        $type = Type::find($id);

        if (! $type) {
            return $this->sendError('Type introuvable.');
        }

        $type->delete();

        return $this->sendResponse(null, 'Type supprimé avec succès.');
    }
}

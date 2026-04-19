<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use App\Models\HotelTypeTarification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HotelTypeTarificationController extends Controller
{
    /**
     * Enregistrer ou mettre à jour les types actifs pour un hôtel.
     *
     * Payload attendu :
     * {
     *   "id_hotel": 1,
     *   "types": [
     *     { "id_type": 3 },
     *     { "id_type": 4 }
     *   ]
     * }
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id_hotel'        => 'required|integer|exists:hotels,id',
            'types'           => 'required|array|min:1',
            'types.*.id_type' => 'required|integer|exists:types,id',
        ]);

        DB::transaction(function () use ($validated) {
            $hotelId = $validated['id_hotel'];

            foreach ($validated['types'] as $typeConfig) {
                HotelTypeTarification::firstOrCreate([
                    'id_hotel' => $hotelId,
                    'id_type'  => $typeConfig['id_type'],
                ]);
            }
        });

        return redirect()->back()->with('success', 'Configuration de tarification enregistrée avec succès.');
    }

    /**
     * Supprimer la configuration d'un type pour un hôtel (le retirer de la grille tarifaire).
     */
    public function destroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id_hotel' => 'required|integer|exists:hotels,id',
            'id_type'  => 'required|integer|exists:types,id',
        ]);

        HotelTypeTarification::where('id_hotel', $validated['id_hotel'])
            ->where('id_type', $validated['id_type'])
            ->delete();

        return redirect()->back()->with('success', 'Type retiré de la grille tarifaire.');
    }
}

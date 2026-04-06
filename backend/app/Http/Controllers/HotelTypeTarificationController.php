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
     * Enregistrer ou mettre à jour la configuration complète de tarification pour un hôtel.
     *
     * Payload attendu :
     * {
     *   "id_hotel": 1,
     *   "essentiel_type_id": 3,          // type essentiel (référence)
     *   "types": [
     *     { "id_type": 3, "pourcentage": 100 },
     *     { "id_type": 4, "pourcentage": 200 },
     *     { "id_type": 5, "pourcentage": 150 }
     *   ]
     * }
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id_hotel'          => 'required|integer|exists:hotels,id',
            'essentiel_type_id' => 'required|integer|exists:types,id',
            'types'             => 'required|array|min:1',
            'types.*.id_type'   => 'required|integer|exists:types,id',
            'types.*.pourcentage' => 'required|numeric|min:1|max:10000',
        ]);

        DB::transaction(function () use ($validated) {
            $hotelId         = $validated['id_hotel'];
            $essentielTypeId = $validated['essentiel_type_id'];

            foreach ($validated['types'] as $typeConfig) {
                HotelTypeTarification::updateOrCreate(
                    [
                        'id_hotel' => $hotelId,
                        'id_type'  => $typeConfig['id_type'],
                    ],
                    [
                        'is_essentiel' => ($typeConfig['id_type'] == $essentielTypeId),
                        'pourcentage'  => $typeConfig['pourcentage'],
                    ]
                );
            }

            // S'assurer qu'il n'y a qu'un seul essentiel pour cet hôtel
            HotelTypeTarification::where('id_hotel', $hotelId)
                ->where('id_type', '!=', $essentielTypeId)
                ->update(['is_essentiel' => false]);
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

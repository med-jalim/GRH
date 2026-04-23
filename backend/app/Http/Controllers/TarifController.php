<?php

namespace App\Http\Controllers;

use App\Models\Tarif;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TarifController extends Controller
{
    public function index()
    {
        return redirect()->route('admin.hotels.index');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id_hotel'    => 'required|integer|exists:hotels,id',
            'id_type'     => 'required|integer|exists:types,id',
            'id_capacity' => 'nullable|integer|exists:hotel_type_capacities,id',
            'prix'        => 'required|numeric|min:0',
            'date_debut'  => 'required|date',
            'date_fin'    => 'required|date|after_or_equal:date_debut',
        ]);

        DB::transaction(function () use ($validated) {
            Tarif::applyRangeSplit(
                hotelId:    (int) $validated['id_hotel'],
                typeId:     (int) $validated['id_type'],
                capacityId: isset($validated['id_capacity']) ? (int) $validated['id_capacity'] : null,
                newStart:   $validated['date_debut'],
                newEnd:     $validated['date_fin'],
                newPrice:   (float) $validated['prix'],
                excludeId: null
            );
        });

        return redirect()->back()->with('success', 'Tarif défini avec succès.');
    }

    public function show(string $id)
    {
        return redirect()->back();
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $tarif = Tarif::findOrFail($id);

        $validated = $request->validate([
            'id_hotel'    => 'sometimes|required|integer|exists:hotels,id',
            'id_type'     => 'sometimes|required|integer|exists:types,id',
            'id_capacity' => 'sometimes|nullable|integer|exists:hotel_type_capacities,id',
            'prix'        => 'sometimes|required|numeric|min:0',
            'date_debut'  => 'sometimes|required|date',
            'date_fin'    => 'sometimes|required|date|after_or_equal:date_debut',
        ]);

        DB::transaction(function () use ($validated, $tarif) {
            // Delete the tarif being edited first to avoid it conflicting with itself
            $tarif->delete();

            Tarif::applyRangeSplit(
                hotelId:    (int) ($validated['id_hotel'] ?? $tarif->id_hotel),
                typeId:     (int) ($validated['id_type'] ?? $tarif->id_type),
                capacityId: array_key_exists('id_capacity', $validated) ? (isset($validated['id_capacity']) ? (int) $validated['id_capacity'] : null) : $tarif->id_capacity,
                newStart:   $validated['date_debut']  ?? $tarif->date_debut->toDateString(),
                newEnd:     $validated['date_fin']    ?? $tarif->date_fin->toDateString(),
                newPrice:   (float) ($validated['prix'] ?? $tarif->prix),
                excludeId: null
            );
        });

        return redirect()->back()->with('success', 'Tarif modifié avec succès.');
    }

    public function destroy(string $id): RedirectResponse
    {
        $tarif = Tarif::findOrFail($id);
        $tarif->delete();

        return redirect()->back()->with('success', 'Tarif supprimé avec succès.');
    }

}

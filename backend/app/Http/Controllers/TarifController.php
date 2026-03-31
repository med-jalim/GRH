<?php

namespace App\Http\Controllers;

use App\Models\Tarif;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TarifController extends Controller
{
    public function index()
    {
        return redirect()->route('admin.hotels.index');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id_hotel'   => 'required|integer|exists:hotels,id',
            'id_type'    => 'required|integer|exists:types,id',
            'prix'       => 'required|numeric|min:0',
            'date_debut' => 'required|date',
            'date_fin'   => 'required|date|after_or_equal:date_debut',
        ]);

        Tarif::create($validated);

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
            'id_hotel'   => 'sometimes|required|integer|exists:hotels,id',
            'id_type'    => 'sometimes|required|integer|exists:types,id',
            'prix'       => 'sometimes|required|numeric|min:0',
            'date_debut' => 'sometimes|required|date',
            'date_fin'   => 'sometimes|required|date|after_or_equal:date_debut',
        ]);

        $tarif->update($validated);

        return redirect()->back()->with('success', 'Tarif modifié avec succès.');
    }

    public function destroy(string $id): RedirectResponse
    {
        $tarif = Tarif::findOrFail($id);
        $tarif->delete();

        return redirect()->back()->with('success', 'Tarif supprimé avec succès.');
    }
}

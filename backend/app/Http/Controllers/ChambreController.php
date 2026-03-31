<?php

namespace App\Http\Controllers;

use App\Models\Chambre;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ChambreController extends Controller
{
    public function index()
    {
        // Now managed inside Hotels/Show.tsx
        return redirect()->route('admin.hotels.index');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'numero'   => 'required|string|max:50|unique:chambres,numero,NULL,id,id_hotel,' . $request->id_hotel,
            'id_hotel' => 'required|integer|exists:hotels,id',
            'id_type'  => 'required|integer|exists:types,id',
        ]);

        Chambre::create($validated);

        return redirect()->back()->with('success', 'Chambre ajoutée avec succès.');
    }

    public function show(string $id)
    {
        return redirect()->back();
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $chambre = Chambre::findOrFail($id);

        $validated = $request->validate([
            'numero'   => 'sometimes|required|string|max:50|unique:chambres,numero,' . $id . ',id,id_hotel,' . ($request->id_hotel ?? $chambre->id_hotel),
            'id_hotel' => 'sometimes|required|integer|exists:hotels,id',
            'id_type'  => 'sometimes|required|integer|exists:types,id',
        ]);

        $chambre->update($validated);

        return redirect()->back()->with('success', 'Chambre modifiée avec succès.');
    }

    public function destroy(string $id): RedirectResponse
    {
        $chambre = Chambre::findOrFail($id);
        $chambre->delete();

        return redirect()->back()->with('success', 'Chambre supprimée avec succès.');
    }
}

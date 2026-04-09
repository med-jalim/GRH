<?php

namespace App\Http\Controllers;

use App\Models\SubType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SubTypeController extends Controller
{
    public function index()
    {
        return redirect()->route('admin.hotels.index');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id_type'     => 'required|integer|exists:types,id',
            'id_hotel'    => 'required|integer|exists:hotels,id',
            'nom'         => 'required|string|max:100',
            'color'       => 'nullable|string|max:15',
            'occupancies' => 'required|array|min:1',
            'occupancies.*.adults'       => 'required|integer|min:0',
            'occupancies.*.children_max' => 'required|integer|min:0',
            'occupancies.*.babies_max'   => 'required|integer|min:0',
        ]);

        $subType = SubType::create([
            'id_type'  => $validated['id_type'],
            'id_hotel' => $validated['id_hotel'],
            'nom'      => $validated['nom'],
            'color'    => $validated['color'] ?? null,
        ]);

        foreach ($validated['occupancies'] as $occ) {
            $subType->occupancies()->create($occ);
        }

        return redirect()->back()->with('success', 'Sous-type ajouté avec succès.');
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $subType = SubType::findOrFail($id);

        $validated = $request->validate([
            'nom'         => 'sometimes|required|string|max:100',
            'color'       => 'nullable|string|max:15',
            'occupancies' => 'sometimes|required|array|min:1',
            'occupancies.*.adults'       => 'required|integer|min:0',
            'occupancies.*.children_max' => 'required|integer|min:0',
            'occupancies.*.babies_max'   => 'required|integer|min:0',
        ]);

        $updateData = [];
        if (isset($validated['nom'])) $updateData['nom'] = $validated['nom'];
        if (array_key_exists('color', $validated)) $updateData['color'] = $validated['color'];

        if (!empty($updateData)) {
            $subType->update($updateData);
        }

        if (isset($validated['occupancies'])) {
            $subType->occupancies()->delete();
            foreach ($validated['occupancies'] as $occ) {
                $subType->occupancies()->create($occ);
            }
        }

        return redirect()->back()->with('success', 'Sous-type modifié avec succès.');
    }

    public function destroy(string $id): RedirectResponse
    {
        $subType = SubType::findOrFail($id);
        $subType->delete();

        return redirect()->back()->with('success', 'Sous-type supprimé avec succès.');
    }
}

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
            'nom'         => 'required|string|max:100',
            'cap_adultes' => 'required|integer|min:0',
            'cap_enfants' => 'required|integer|min:0',
            'cap_bebes'   => 'required|integer|min:0',
        ]);

        SubType::create($validated);

        return redirect()->back()->with('success', 'Sous-type ajouté avec succès.');
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $subType = SubType::findOrFail($id);

        $validated = $request->validate([
            'id_type'     => 'sometimes|required|integer|exists:types,id',
            'nom'         => 'sometimes|required|string|max:100',
            'cap_adultes' => 'sometimes|required|integer|min:0',
            'cap_enfants' => 'sometimes|required|integer|min:0',
            'cap_bebes'   => 'sometimes|required|integer|min:0',
        ]);

        $subType->update($validated);

        return redirect()->back()->with('success', 'Sous-type modifié avec succès.');
    }

    public function destroy(string $id): RedirectResponse
    {
        $subType = SubType::findOrFail($id);
        $subType->delete();

        return redirect()->back()->with('success', 'Sous-type supprimé avec succès.');
    }
}

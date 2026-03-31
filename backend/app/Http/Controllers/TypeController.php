<?php

namespace App\Http\Controllers;

use App\Models\Type;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TypeController extends Controller
{
    public function index()
    {
        return redirect()->route('admin.hotels.index');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nom'         => 'required|string|max:100',
            'description' => 'nullable|string',
        ]);

        Type::create($validated);

        return redirect()->back()->with('success', 'Type de chambre ajouté avec succès.');
    }

    public function show(string $id)
    {
        return redirect()->back();
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $type = Type::findOrFail($id);

        $validated = $request->validate([
            'nom'         => 'sometimes|required|string|max:100',
            'description' => 'nullable|string',
        ]);

        $type->update($validated);

        return redirect()->back()->with('success', 'Type de chambre modifié avec succès.');
    }

    public function destroy(string $id): RedirectResponse
    {
        $type = Type::findOrFail($id);
        $type->delete();

        return redirect()->back()->with('success', 'Type de chambre supprimé avec succès.');
    }
}

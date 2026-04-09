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
            'id_sub_type' => 'required|integer|exists:sub_types,id',
            'prix'        => 'required|numeric|min:0',
            'date_debut'  => 'required|date',
            'date_fin'    => 'required|date|after_or_equal:date_debut',
        ]);

        DB::transaction(function () use ($validated) {
            $this->applyRangeSplit(
                hotelId:   $validated['id_hotel'],
                typeId:    $validated['id_type'],
                subTypeId: $validated['id_sub_type'],
                newStart:  Carbon::parse($validated['date_debut']),
                newEnd:    Carbon::parse($validated['date_fin']),
                newPrice:  $validated['prix'],
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
            'id_sub_type' => 'sometimes|required|integer|exists:sub_types,id',
            'prix'        => 'sometimes|required|numeric|min:0',
            'date_debut'  => 'sometimes|required|date',
            'date_fin'    => 'sometimes|required|date|after_or_equal:date_debut',
        ]);

        DB::transaction(function () use ($validated, $tarif) {
            // Delete the tarif being edited first to avoid it conflicting with itself
            $tarif->delete();

            $this->applyRangeSplit(
                hotelId:   $validated['id_hotel']    ?? $tarif->id_hotel,
                typeId:    $validated['id_type']     ?? $tarif->id_type,
                subTypeId: $validated['id_sub_type'] ?? $tarif->id_sub_type,
                newStart:  Carbon::parse($validated['date_debut'] ?? $tarif->date_debut),
                newEnd:    Carbon::parse($validated['date_fin']   ?? $tarif->date_fin),
                newPrice:  $validated['prix']        ?? $tarif->prix,
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

    /**
     * Core Range Splitting Logic (used by store & update)
     *
     * When the new period overlaps with existing ones for the same hotel+type,
     * existing periods are automatically trimmed or split to avoid conflicts.
     *
     * Scenarios handled:
     *
     *   Case A — New period completely covers existing:
     *     [===existing===]           → deleted
     *           [===NEW===]
     *
     *   Case B — Existing starts before and ends within new:
     *     [=====existing====]        → trimmed: end becomes newStart - 1 day
     *               [===NEW===]
     *
     *   Case C — Existing starts within and ends after new:
     *            [===existing====]   → trimmed: start becomes newEnd + 1 day
     *     [===NEW===]
     *
     *   Case D — Existing completely wraps the new period (split):
     *     [========existing=========]→ split into LEFT part and RIGHT part
     *              [===NEW===]
     */
    private function applyRangeSplit(
        int    $hotelId,
        int    $typeId,
        int    $subTypeId,
        Carbon $newStart,
        Carbon $newEnd,
        float  $newPrice,
        ?int   $excludeId
    ): void {
        // Fetch all overlapping tarifs for the same hotel+type+sub_type
        $overlapping = Tarif::where('id_hotel', $hotelId)
            ->where('id_type', $typeId)
            ->where('id_sub_type', $subTypeId)
            ->where('date_debut', '<=', $newEnd->toDateString())
            ->where('date_fin',   '>=', $newStart->toDateString())
            ->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))
            ->get();

        foreach ($overlapping as $existing) {
            $exStart = Carbon::parse($existing->date_debut);
            $exEnd   = Carbon::parse($existing->date_fin);

            $leftEnd   = $newStart->copy()->subDay();  // Day before new start
            $rightStart = $newEnd->copy()->addDay();   // Day after new end

            $hasLeft  = $exStart->lte($leftEnd);   // Existing starts before new
            $hasRight = $exEnd->gte($rightStart);   // Existing ends after new

            if ($hasLeft && $hasRight) {
                // Case D: Split into two pieces
                // Left piece: exStart → newStart - 1
                $existing->update(['date_fin' => $leftEnd->toDateString()]);

                // Right piece: newEnd + 1 → exEnd (new record)
                Tarif::create([
                    'id_hotel'    => $existing->id_hotel,
                    'id_type'     => $existing->id_type,
                    'id_sub_type' => $existing->id_sub_type,
                    'prix'        => $existing->prix,
                    'date_debut'  => $rightStart->toDateString(),
                    'date_fin'    => $exEnd->toDateString(),
                ]);
            } elseif ($hasLeft) {
                // Case B: Trim the end of existing period
                $existing->update(['date_fin' => $leftEnd->toDateString()]);
            } elseif ($hasRight) {
                // Case C: Trim the start of existing period
                $existing->update(['date_debut' => $rightStart->toDateString()]);
            } else {
                // Case A: Existing is fully inside new → delete it
                $existing->delete();
            }
        }

        // Finally, create the new tarif
        Tarif::create([
            'id_hotel'    => $hotelId,
            'id_type'     => $typeId,
            'id_sub_type' => $subTypeId,
            'prix'        => $newPrice,
            'date_debut'  => $newStart->toDateString(),
            'date_fin'    => $newEnd->toDateString(),
        ]);
    }
}

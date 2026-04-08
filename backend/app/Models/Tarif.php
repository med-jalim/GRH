<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tarif extends Model
{
    protected $fillable = [
        'id_type',
        'id_hotel',
        'prix',
        'date_debut',
        'date_fin'
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin'   => 'date',
    ];

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class, 'id_hotel');
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(Type::class, 'id_type');
    }

    /**
     * Centralized Range Splitting Logic.
     * Trims, splits or deletes existing periods that overlap with the new range.
     */
    public static function applyRangeSplit(
        int    $hotelId,
        int    $typeId,
        string $newStart,
        string $newEnd,
        float  $newPrice,
        ?int   $excludeId = null
    ): void {
        $nStart = \Carbon\Carbon::parse($newStart);
        $nEnd   = \Carbon\Carbon::parse($newEnd);

        // Fetch overlapping tarifs for the same hotel+type
        $overlapping = self::where('id_hotel', $hotelId)
            ->where('id_type', $typeId)
            ->where('date_debut', '<=', $nEnd->toDateString())
            ->where('date_fin',   '>=', $nStart->toDateString())
            ->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))
            ->get();

        foreach ($overlapping as $existing) {
            $exStart = \Carbon\Carbon::parse($existing->date_debut);
            $exEnd   = \Carbon\Carbon::parse($existing->date_fin);

            $leftEnd    = $nStart->copy()->subDay();
            $rightStart = $nEnd->copy()->addDay();

            $hasLeft  = $exStart->lte($leftEnd);
            $hasRight = $exEnd->gte($rightStart);

            if ($hasLeft && $hasRight) {
                // Case D: Split into two pieces
                $existing->update(['date_fin' => $leftEnd->toDateString()]);
                self::create([
                    'id_hotel'   => $existing->id_hotel,
                    'id_type'    => $existing->id_type,
                    'prix'       => $existing->prix,
                    'date_debut' => $rightStart->toDateString(),
                    'date_fin'   => $exEnd->toDateString(),
                ]);
            } elseif ($hasLeft) {
                // Case B: Trim end
                $existing->update(['date_fin' => $leftEnd->toDateString()]);
            } elseif ($hasRight) {
                // Case C: Trim start
                $existing->update(['date_debut' => $rightStart->toDateString()]);
            } else {
                // Case A: Delete fully covered
                $existing->delete();
            }
        }

        // Create the final range
        self::create([
            'id_hotel'   => $hotelId,
            'id_type'    => $typeId,
            'prix'       => $newPrice,
            'date_debut' => $nStart->toDateString(),
            'date_fin'   => $nEnd->toDateString(),
        ]);
    }
}

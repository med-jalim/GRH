<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tarif extends Model
{
    protected $fillable = [
        'id_type',
        'id_hotel',
        'id_capacity',
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

    public function capacity(): BelongsTo
    {
        return $this->belongsTo(HotelTypeCapacity::class, 'id_capacity');
    }

    /**
     * Centralized Range Splitting Logic.
     * Trims, splits or deletes existing periods that overlap with the new range.
     */
    public static function applyRangeSplit(
        int    $hotelId,
        ?int   $typeId = null,
        ?int   $capacityId = null,
        string $newStart = '',
        string $newEnd = '',
        float  $newPrice = 0.0,
        ?int   $excludeId = null
    ): void {
        $nStart = \Carbon\Carbon::parse($newStart);
        $nEnd   = \Carbon\Carbon::parse($newEnd);

        // Fetch overlapping tarifs for the same hotel + (type OR capacity)
        $query = self::where('id_hotel', $hotelId)
            ->where('date_debut', '<=', $nEnd->toDateString())
            ->where('date_fin',   '>=', $nStart->toDateString());

        if ($capacityId) {
            $query->where('id_capacity', $capacityId);
        } else {
            $query->where('id_type', $typeId)->whereNull('id_capacity');
        }

        $overlapping = $query->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))
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
                    'id_hotel'    => $existing->id_hotel,
                    'id_type'     => $existing->id_type,
                    'id_capacity' => $existing->id_capacity,
                    'prix'        => $existing->prix,
                    'date_debut'  => $rightStart->toDateString(),
                    'date_fin'    => $exEnd->toDateString(),
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
            'id_hotel'    => $hotelId,
            'id_type'     => $typeId,
            'id_capacity' => $capacityId,
            'prix'        => $newPrice,
            'date_debut'  => $nStart->toDateString(),
            'date_fin'    => $nEnd->toDateString(),
        ]);
    }
}

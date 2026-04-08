<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HotelTypeCapacity extends Model
{
    protected $fillable = [
        'id_hotel',
        'id_type',
        'capacite_adultes',
        'capacite_enfants',
    ];

    protected $casts = [
        'capacite_adultes' => 'integer',
        'capacite_enfants' => 'integer',
        'capacite_bebes'   => 'integer',
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
     * Total capacity for this room type in this hotel.
     */
    public function getCapaciteTotaleAttribute(): int
    {
        return $this->capacite_adultes + $this->capacite_enfants
             + $this->capacite_bebes;
    }
}

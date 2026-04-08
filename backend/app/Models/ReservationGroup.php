<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReservationGroup extends Model
{
    protected $fillable = [
        'id_reservation',
        'date_arrivee',
        'date_depart',
        'nb_personnes'
    ];

    /**
     * Get the reservation that owns the group.
     */
    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class, 'id_reservation');
    }

    /**
     * Get the items (rooms) associated with this group.
     */
    public function items(): HasMany
    {
        return $this->hasMany(ItemReservation::class, 'id_group');
    }

    /**
     * Calculate the number of nights for this group.
     */
    public function getNightsAttribute(): int
    {
        $checkIn = new \DateTime($this->date_arrivee);
        $checkOut = new \DateTime($this->date_depart);
        return max(1, $checkOut->diff($checkIn)->days);
    }
}

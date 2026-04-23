<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemReservation extends Model
{
    // Important: manually specify the table name because Laravel expects item_reservations
    protected $table = 'reservation_items';

    protected $fillable = [
        'id_reservation',
        'id_group',
        'id_type',
        'id_capacity',
        'quantite',
        'prix_unitaire',
        'nb_adultes',
        'nb_enfants',
    ];

    public function getPrixTotalAttribute(): float
    {
        $nights = $this->group ? $this->group->nights : 1;
        return (float) ($this->quantite ?? 1) * (float) ($this->prix_unitaire ?? 0) * $nights;
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class, 'id_reservation');
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(ReservationGroup::class, 'id_group');
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(Type::class, 'id_type');
    }

    public function capacity(): BelongsTo
    {
        return $this->belongsTo(HotelTypeCapacity::class, 'id_capacity');
    }
}

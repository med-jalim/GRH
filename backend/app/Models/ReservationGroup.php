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
        'nb_personnes',
        'remise_pourcentage',
        'remise_montant'
    ];

    protected $casts = [
        'date_arrivee' => 'date',
        'date_depart'  => 'date',
    ];

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class, 'id_reservation');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ItemReservation::class, 'id_group');
    }
}

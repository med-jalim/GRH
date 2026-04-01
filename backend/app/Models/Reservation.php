<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reservation extends Model
{
    protected $fillable = [
        'nom_agence',
        'nom_contact',
        'code_agence',
        'email',
        'telephone',
        'id_hotel',
        'date_arrivee',
        'date_depart',
        'nb_personnes',
        'prix_total',
        'remarques_speciales',
        'statut',
        'code_reference'
    ];

    protected $casts = [
        'date_arrivee' => 'date',
        'date_depart'  => 'date',
    ];

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class, 'id_hotel');
    }

    public function details(): HasMany
    {
        return $this->hasMany(ItemReservation::class, 'id_reservation');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(PaymentVerification::class, 'id_reservation');
    }
}

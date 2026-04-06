<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemReservation extends Model
{
    // Important: manually specify the table name because Laravel expects item_reservations
    protected $table = 'reservation_items';

    protected $fillable = [
        'id_group',
        'id_type',
        'quantite',
        'prix_unitaire',
        'date_arrivee',
        'date_depart',
        'nb_personnes'
    ];

    protected $casts = [
        'date_arrivee' => 'date',
        'date_depart'  => 'date',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(ReservationGroup::class, 'id_group');
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(Type::class, 'id_type');
    }
}

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
        'id_type',
        'quantite',
        'prix_unitaire'
    ];

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class, 'id_reservation');
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(Type::class, 'id_type');
    }
}

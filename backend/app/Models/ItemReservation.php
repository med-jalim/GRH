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
        'id_sub_type',
        'quantite',
        'prix_unitaire',
        'nb_adultes',
        'nb_enfants',
    ];

    protected $casts = [
        // No dates to cast anymore in this model
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(ReservationGroup::class, 'id_group');
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(Type::class, 'id_type');
    }

    public function subType(): BelongsTo
    {
        return $this->belongsTo(SubType::class, 'id_sub_type');
    }
}

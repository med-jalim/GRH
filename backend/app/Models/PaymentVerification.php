<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentVerification extends Model
{
    protected $fillable = [
        'id_reservation',
        'document_path',
        'amount',
        'statut'
    ];

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class, 'id_reservation');
    }
}

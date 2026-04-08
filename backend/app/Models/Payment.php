<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'id_reservation',
        'amount',
        'payment_date',
        'proof_path',
        'provenance',
        'notes',
        'is_verified',
        'status',
        'verified_at',
        'verified_by',
        'notes_admin',
    ];

    protected $casts = [
        'payment_date' => 'datetime',
        'amount'       => 'decimal:2',
        'verified_at'  => 'datetime',
        'is_verified'  => 'boolean',
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class, 'id_reservation');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}

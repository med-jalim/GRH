<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Carbon;

class Reservation extends Model
{
    protected $fillable = [
        'nom_agence',
        'nom_contact',
        'code_agence',
        'email',
        'telephone',
        'id_hotel',
        'nb_personnes',
        'prix_total',
        'remarques_speciales',
        'statut',
        'code_reference',
        'payment_link',
        'token',
        'paid_amount',
        'total_amount'
    ];

    protected $appends = ['date_arrivee', 'date_depart'];

    protected $casts = [
        'paid_amount'  => 'float',
        'total_amount' => 'float',
        'date_arrivee' => 'date',
        'date_depart'  => 'date',
    ];

    protected function dateArrivee(): Attribute
    {
        return Attribute::get(function ($value) {
            $min = $this->groups()->min('date_arrivee');
            return $min ? Carbon::parse($min) : ($value ? Carbon::parse($value) : null);
        });
    }

    protected function dateDepart(): Attribute
    {
        return Attribute::get(function ($value) {
            $max = $this->groups()->max('date_depart');
            return $max ? Carbon::parse($max) : ($value ? Carbon::parse($value) : null);
        });
    }

    protected static function booted()
    {
        static::creating(function ($reservation) {
            if (!$reservation->token) {
                $reservation->token = \Illuminate\Support\Str::random(64);
            }
            // Sync total_amount with prix_total on creation
            if (!$reservation->total_amount && $reservation->prix_total) {
                $reservation->total_amount = $reservation->prix_total;
            }
        });

        static::updating(function ($reservation) {
            // Keep total_amount in sync with prix_total if prix_total changes
            if ($reservation->isDirty('prix_total')) {
                $reservation->total_amount = $reservation->prix_total;
            }
        });
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class, 'id_hotel');
    }

    public function groups(): HasMany
    {
        return $this->hasMany(ReservationGroup::class, 'id_reservation');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(PaymentVerification::class, 'id_reservation');
    }
}

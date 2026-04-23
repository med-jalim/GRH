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
        'client_type',
        'date_arrivee',
        'date_depart',
        'nb_personnes',
        'prix_total',
        'remarques_speciales',
        'statut',
        'code_reference',
        'lien_paiement',
        'montant_paye',
    ];

    protected $appends = [
        'montant_restant',
        'pourcentage_paiement',
    ];

    protected $casts = [
        'date_arrivee'    => 'date',
        'date_depart'     => 'date',
        'montant_paye'    => 'decimal:2',
    ];

    public function getMontantRestantAttribute(): float
    {
        return max(0, $this->prix_total - (float) $this->montant_paye);
    }

    public function getPourcentagePaiementAttribute(): int
    {
        if ($this->prix_total <= 0) return 0;
        return (int) min(100, round(($this->montant_paye / $this->prix_total) * 100));
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class, 'id_hotel');
    }

    public function details(): HasMany
    {
        return $this->hasMany(ItemReservation::class, 'id_reservation');
    }

    public function groups(): HasMany
    {
        return $this->hasMany(ReservationGroup::class, 'id_reservation');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'id_reservation')->orderByDesc('payment_date');
    }
}

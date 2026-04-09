<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Hotel extends Model
{
    protected $fillable = ['name', 'stars', 'ville', 'description', 'telephone', 'email', 'adresse', 'rib'];

    public function chambres(): HasMany
    {
        return $this->hasMany(Chambre::class, 'id_hotel');
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class, 'id_hotel');
    }

    public function tarifs(): HasMany
    {
        return $this->hasMany(Tarif::class, 'id_hotel');
    }

    public function typeTarifications(): HasMany
    {
        return $this->hasMany(HotelTypeTarification::class, 'id_hotel');
    }

    public function getAvailableSubTypesQuery()
    {
        return SubType::whereIn('id_type', $this->typeTarifications()->pluck('id_type'));
    }

    /**
     * Calcule le prix par nuit d'un sous-type de chambre à une date donnée.
     *
     * - Trouve le tarif explicite de ce sous-type valide à cette date.
     * - Retourne null si aucun tarif trouvé.
     */
    public function getPrixPourSubType(int $subTypeId, Carbon $date): ?float
    {
        $tarif = $this->tarifs()
            ->where('id_sub_type', $subTypeId)
            ->where('date_debut', '<=', $date->toDateString())
            ->where('date_fin',   '>=', $date->toDateString())
            ->first();

        return $tarif ? (float) $tarif->prix : null;
    }

    /**
     * Scope to load all relationships needed for the booking form.
     */
    public function scopeWithBookingData($query)
    {
        return $query->with([
            'chambres.type.subTypes.occupancies',
            'chambres.subType',
            'tarifs.type',
            'tarifs.subType',
            'typeTarifications.type'
        ]);
    }
}

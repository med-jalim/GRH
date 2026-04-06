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

    /**
     * Calcule le prix par nuit d'un type de chambre à une date donnée.
     *
     * - Trouve le tarif de la chambre essentielle valide à cette date.
     * - Multiplie par le pourcentage du type demandé.
     * - Retourne null si aucune config ou tarif trouvé.
     */
    public function getPrixPourType(int $typeId, Carbon $date): ?float
    {
        // 0. Vérifier d'abord s'il y a un tarif explicite pour ce type à cette date
        $tarifExplicite = $this->tarifs()
            ->where('id_type', $typeId)
            ->where('date_debut', '<=', $date->toDateString())
            ->where('date_fin',   '>=', $date->toDateString())
            ->first();

        // Si on a un tarif explicite défini (que ce soit pour l'essentiel ou non), il prime.
        if ($tarifExplicite) {
            return (float) $tarifExplicite->prix;
        }

        // 1. Sinon, trouver la config essentielle pour cet hôtel (calcul relatif)
        $essentielConfig = $this->typeTarifications()
            ->where('is_essentiel', true)
            ->first();

        if (! $essentielConfig) {
            return null;
        }

        // 2. Trouver le tarif de la chambre essentielle valide à la date donnée
        $tarifEssentiel = $this->tarifs()
            ->where('id_type', $essentielConfig->id_type)
            ->where('date_debut', '<=', $date->toDateString())
            ->where('date_fin',   '>=', $date->toDateString())
            ->first();

        if (! $tarifEssentiel) {
            return null;
        }

        // 3. Si le type demandé est l'essentiel, retourner directement son prix
        if ($typeId === $essentielConfig->id_type) {
            return (float) $tarifEssentiel->prix;
        }

        // 4. Trouver le pourcentage du type demandé
        $typeConfig = $this->typeTarifications()
            ->where('id_type', $typeId)
            ->first();

        if (! $typeConfig) {
            return null;
        }

        return round($tarifEssentiel->prix * ($typeConfig->pourcentage / 100), 2);
    }
}

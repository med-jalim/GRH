<?php

namespace App\Models;

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
}

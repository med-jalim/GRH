<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Type extends Model
{
    protected $fillable = ['nom', 'description'];

    public function chambres(): HasMany
    {
        return $this->hasMany(Chambre::class, 'id_type');
    }

    public function tarifs(): HasMany
    {
        return $this->hasMany(Tarif::class, 'id_type');
    }

    public function detailsReservation(): HasMany
    {
        return $this->hasMany(ItemReservation::class, 'id_type');
    }
}

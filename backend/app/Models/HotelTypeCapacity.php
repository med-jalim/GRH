<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HotelTypeCapacity extends Model
{
    protected $fillable = [
        'id_hotel',
        'id_type',
        'label',
        'capacite_adultes',
        'capacite_enfants',
        'capacite_totale',
    ];

    protected $casts = [
        'capacite_adultes' => 'integer',
        'capacite_enfants' => 'integer',
        'capacite_bebes'   => 'integer',
        'capacite_totale'  => 'integer',
    ];

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class, 'id_hotel');
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(Type::class, 'id_type');
    }

    public function tarifs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Tarif::class, 'id_capacity');
    }


}

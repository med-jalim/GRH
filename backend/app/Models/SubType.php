<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubType extends Model
{
    protected $fillable = [
        'id_hotel',
        'id_type',
        'nom',
        'color',
    ];

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class, 'id_hotel');
    }

    public function occupancies(): HasMany
    {
        return $this->hasMany(SubTypeOccupancy::class, 'id_sub_type');
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(Type::class, 'id_type');
    }

    public function tarifs(): HasMany
    {
        return $this->hasMany(Tarif::class, 'id_sub_type');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ItemReservation::class, 'id_sub_type');
    }
}

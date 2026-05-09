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
        'prix_standard',
        'color',
        'max_adults',
        'max_children',
        'capacity_total',
    ];

    protected $casts = [
        'prix_standard' => 'float',
        'max_adults' => 'integer',
        'max_children' => 'integer',
        'capacity_total' => 'integer',
    ];

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class, 'id_hotel');
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

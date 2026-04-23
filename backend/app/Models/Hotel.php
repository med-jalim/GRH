<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Hotel extends Model
{
    protected $fillable = ['name', 'stars', 'ville', 'description', 'telephone', 'email', 'adresse', 'rib', 'main_type_id', 'agency_price_percentage', 'group_price_percentage', 'tax_percentage'];

    public function mainType(): BelongsTo
    {
        return $this->belongsTo(Type::class, 'main_type_id');
    }

    public function pricingRules(): HasMany
    {
        return $this->hasMany(HotelTypePricingRule::class, 'id_hotel');
    }

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

    public function typeCapacities(): HasMany
    {
        return $this->hasMany(HotelTypeCapacity::class, 'id_hotel');
    }

    public function discounts(): HasMany
    {
        return $this->hasMany(Discount::class, 'id_hotel');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HotelTypeTarification extends Model
{
    protected $table = 'hotel_type_tarification';

    protected $fillable = [
        'id_hotel',
        'id_type',
        'is_essentiel',
        'pourcentage',
    ];

    protected $casts = [
        'is_essentiel' => 'boolean',
        'pourcentage'  => 'float',
    ];

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class, 'id_hotel');
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(Type::class, 'id_type');
    }
}

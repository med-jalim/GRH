<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Discount extends Model
{
    protected $fillable = [
        'id_hotel',
        'name',
        'type',
        'value',
        'condition_type',
        'condition_value',
        'is_active',
    ];

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class, 'id_hotel');
    }

    protected $casts = [
        'value'           => 'float',
        'condition_value' => 'integer',
        'is_active'       => 'boolean',
    ];

    /**
     * Get only active discounts.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

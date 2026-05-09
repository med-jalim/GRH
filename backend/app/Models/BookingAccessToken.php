<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingAccessToken extends Model
{
    protected $fillable = [
        'token',
        'expires_at',
        'is_used',
        'client_name',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    /**
     * Scope to check if token is still valid.
     */
    public function scopeValid($query)
    {
        return $query->where('is_used', false)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            });
    }
}

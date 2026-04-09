<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tarif extends Model
{
    protected $fillable = [
        'id_type',
        'id_sub_type',
        'id_hotel',
        'prix',
        'date_debut',
        'date_fin'
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin'   => 'date',
    ];

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class, 'id_hotel');
    }

    public function subType(): BelongsTo
    {
        return $this->belongsTo(SubType::class, 'id_sub_type');
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(Type::class, 'id_type');
    }
}

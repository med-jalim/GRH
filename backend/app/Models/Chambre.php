<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Chambre extends Model
{
    protected $fillable = ['numero', 'id_hotel', 'id_type', 'id_sub_type'];

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class, 'id_hotel');
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(Type::class, 'id_type');
    }

    public function subType(): BelongsTo
    {
        return $this->belongsTo(SubType::class, 'id_sub_type');
    }
}

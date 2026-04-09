<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubTypeOccupancy extends Model
{
    protected $table = 'sub_type_occupancies';

    protected $fillable = [
        'id_sub_type',
        'adults',
        'children_max',
        'babies_max'
    ];

    public function subType(): BelongsTo
    {
        return $this->belongsTo(SubType::class, 'id_sub_type');
    }
}

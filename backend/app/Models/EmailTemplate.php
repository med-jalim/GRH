<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'subject',
        'content_html',
        'content_json',
    ];

    protected $casts = [
        'content_json' => 'array',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tarif extends Model
{
    protected $fillable = ['id_type','id_hotel','prix','date_d','date_f'];
}

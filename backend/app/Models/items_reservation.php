<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class chembre_reservation extends Model
{
    protected $fillable = ['id_chembre','id_reservation','quantite','prix_unitaire'];
}

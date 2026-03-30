<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $fillable = [
        'nom_agence',
        'nom_contact',
        'code_agence',
        'email',
        'telephone',
        'id_hotel',
        'date_arrivee',
        'date_depart',
        'nb_personnes',
        'prix_total',
        'remarques_speciales',
        'statut',
        'code_reference'
    ];
}

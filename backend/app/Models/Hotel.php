<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hotel extends Model
{
    protected $fillable = ['name','stars','ville','description'];

    public function chambres (){
        return $this->hasMany(Chambre::class,'id_hotel');
    }

    public function tarifs (){
        return $this->hasMany(Chambre::class,'id_hotel');
    }
   
}

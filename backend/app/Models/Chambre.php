<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chambre extends Model
{
    protected $fillable = ['numero','id_hotel','id_type'];

    public function hotel (){
        return $this->belongsTo(Hotel::class,'')  ;
    }
}

<?php

namespace Database\Seeders;

use App\Models\Hotel;
use App\Models\Tarif;
use App\Models\Type;
use Illuminate\Database\Seeder;

class TarifSeeder extends Seeder
{
    public function run(): void
    {
        $hotels = Hotel::all();
        $types  = Type::all();

        foreach ($hotels as $hotel) {
            foreach ($types as $type) {
                // Définir un prix de base selon le type
                $basePrice = match($type->nom) {
                    'Chambre Single' => 6000,
                    'Chambre Double' => 8500,
                    'Chambre Triple' => 11000,
                    'Suite Junior'   => 15000,
                    default          => 5000,
                };

                // Ajouter une petite variation selon les étoiles de l'hôtel
                $prixFinal = $basePrice + ($hotel->stars * 1000);

                Tarif::create([
                    'id_hotel'   => $hotel->id,
                    'id_type'    => $type->id,
                    'prix'       => $prixFinal,
                    'date_debut' => now()->startOfYear(),
                    'date_fin'   => now()->endOfYear(),
                ]);
            }
        }
    }
}

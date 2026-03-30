<?php

namespace Database\Seeders;

use App\Models\Chambre;
use App\Models\Hotel;
use App\Models\Type;
use Illuminate\Database\Seeder;

class ChambreSeeder extends Seeder
{
    public function run(): void
    {
        $hotels = Hotel::all();
        $types  = Type::all();

        foreach ($hotels as $hotel) {
            foreach ($types as $index => $type) {
                // Création automatique de 2-5 chambres par type par hôtel
                for ($i = 1; $i <= rand(2, 5); $i++) {
                    Chambre::create([
                        'numero'   => ($index + 1) . '0' . $i,
                        'id_hotel' => $hotel->id,
                        'id_type'  => $type->id,
                    ]);
                }
            }
        }
    }
}

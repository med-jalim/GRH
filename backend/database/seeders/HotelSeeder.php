<?php

namespace Database\Seeders;

use App\Models\Hotel;
use Illuminate\Database\Seeder;

class HotelSeeder extends Seeder
{
    public function run(): void
    {
        Hotel::create([
            'name'        => 'Hôtel Safir',
            'stars'       => 4,
            'ville'       => 'Alger',
            'description' => 'Un hôtel historique au cœur de la capitale avec une vue magnifique sur le port.'
        ]);

        Hotel::create([
            'name'        => 'Hôtel El Djazaïr',
            'stars'       => 5,
            'ville'       => 'Alger',
            'description' => 'Luxe et tradition dans un cadre mauresque exceptionnel.'
        ]);

        Hotel::create([
            'name'        => 'Hôtel Liberté',
            'stars'       => 3,
            'ville'       => 'Oran',
            'description' => 'Hôtel moderne et confortable pour vos séjours professionnels à Oran.'
        ]);
    }
}

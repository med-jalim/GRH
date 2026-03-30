<?php

namespace Database\Seeders;

use App\Models\Type;
use Illuminate\Database\Seeder;

class TypeSeeder extends Seeder
{
    public function run(): void
    {
        Type::create(['nom' => 'Chambre Single', 'description' => 'Une chambre pour une personne.']);
        Type::create(['nom' => 'Chambre Double', 'description' => 'Une chambre pour deux personnes.']);
        Type::create(['nom' => 'Chambre Triple', 'description' => 'Une chambre pour trois personnes.']);
        Type::create(['nom' => 'Suite Junior',  'description' => 'Suite de luxe avec espace salon.']);
    }
}

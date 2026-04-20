<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AppSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\AppSetting::updateOrCreate(
            ['key' => 'agency_discount_percentage'],
            [
                'value'       => '4.0',
                'label'       => 'Remise par défaut Agence (%)',
                'type'        => 'number',
                'description' => 'Pourcentage de remise appliqué automatiquement aux réservations de type "Agence".'
            ]
        );
    }
}

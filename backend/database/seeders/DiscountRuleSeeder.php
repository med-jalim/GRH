<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DiscountRuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\DiscountRule::updateOrCreate(
            ['min_nights' => 12],
            ['discount_percentage' => 9.0]
        );
    }
}

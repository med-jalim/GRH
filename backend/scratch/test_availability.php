<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

use App\Services\ReservationService;
use Illuminate\Contracts\Console\Kernel;

$app->make(Kernel::class)->bootstrap();

$service = new ReservationService();
$groups = [
    [
        'uid' => 'g1',
        'date_arrivee' => '2026-05-01',
        'date_depart' => '2026-05-05',
        'rooms' => [
            ['uid' => 'r1', 'roomTypeId' => 1, 'subTypeId' => 1, 'quantity' => 4]
        ]
    ]
];

print_r($service->checkDetailedAvailability(1, $groups));

echo "\n--- Test Overcapacity ---\n";
$groups2 = [
    [
        'uid' => 'g1',
        'date_arrivee' => '2026-05-01',
        'date_depart' => '2026-05-05',
        'rooms' => [
            ['uid' => 'r1', 'roomTypeId' => 1, 'subTypeId' => 1, 'quantity' => 5]
        ]
    ]
];
print_r($service->checkDetailedAvailability(1, $groups2));

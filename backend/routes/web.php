<?php

use App\Http\Controllers\ChambreController;
use App\Http\Controllers\HotelController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\TarifController;
use App\Http\Controllers\TypeController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// ----- Hotel -----
Route::apiResource('hotels', HotelController::class);

// ----- Chambre -----
Route::apiResource('chambres', ChambreController::class);

// ----- Type de chambre -----
Route::apiResource('types', TypeController::class);

// ----- Tarif -----
Route::apiResource('tarifs', TarifController::class);

// ----- Réservation -----
Route::apiResource('reservations', ReservationController::class);
Route::patch('reservations/{id}/statut', [ReservationController::class, 'updateStatut']);
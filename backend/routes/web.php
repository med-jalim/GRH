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

Route::get('/booking', [HotelController::class, 'bookingPage'])->name('booking');

// ----- Hotel -----
Route::resource('hotels', HotelController::class);

// ----- Chambre -----
Route::resource('chambres', ChambreController::class);

// ----- Type de chambre -----
Route::resource('types', TypeController::class);

// ----- Tarif -----
Route::resource('tarifs', TarifController::class);

// ----- Réservation -----
Route::resource('reservations', ReservationController::class);
Route::patch('reservations/{id}/statut', [ReservationController::class, 'updateStatut']);
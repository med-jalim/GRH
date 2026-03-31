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

// ----- Espace Administrateur (Back-Office) -----
Route::prefix('admin')->name('admin.')->group(function () {
    // Tableau de bord
    Route::get('/dashboard', function () {
        return \Inertia\Inertia::render('Admin/Dashboard');
    })->name('dashboard');

    // Réservations
    Route::resource('reservations', ReservationController::class);
    Route::patch('reservations/{id}/statut', [ReservationController::class, 'updateStatut'])->name('reservations.updateStatut');

    // Gestion de l'Hôtel
    Route::resource('hotels', HotelController::class);
    Route::resource('chambres', ChambreController::class);
    Route::resource('types', TypeController::class);
    Route::resource('tarifs', TarifController::class);
});
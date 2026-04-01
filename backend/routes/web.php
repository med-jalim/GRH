<?php

use App\Http\Controllers\ChambreController;
use App\Http\Controllers\HotelController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\TarifController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TypeController;
use App\Http\Controllers\PaymentVerificationController;
use App\Http\Controllers\ClientReservationController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/booking', [HotelController::class, 'bookingPage'])->name('booking');

// ----- Public Reservation Actions (via Token) -----
Route::get('/reservation/{token}/confirm', [ClientReservationController::class, 'confirm'])->name('reservation.confirm');
Route::get('/reservation/{token}/cancel', [ClientReservationController::class, 'cancel'])->name('reservation.cancel');
Route::get('/reservation/{token}/edit', [ClientReservationController::class, 'edit'])->name('reservation.edit');
Route::post('/reservation/{token}/update', [ClientReservationController::class, 'update'])->name('reservation.update');

// ----- Espace Administrateur (Back-Office) -----
Route::prefix('admin')->name('admin.')->group(function () {
    // Tableau de bord
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard'); 

    // Réservations
    Route::resource('reservations', ReservationController::class);
    Route::patch('reservations/{id}/statut', [ReservationController::class, 'updateStatut'])->name('reservations.updateStatut');
    Route::post('reservations/{id}/payments', [PaymentVerificationController::class, 'store'])->name('reservations.payments.store');
    Route::delete('payments/{id}', [PaymentVerificationController::class, 'destroy'])->name('reservations.payments.destroy');

    // Gestion de l'Hôtel
    Route::resource('hotels', HotelController::class);
    Route::resource('chambres', ChambreController::class);
    Route::resource('types', TypeController::class);
    Route::resource('tarifs', TarifController::class);
});
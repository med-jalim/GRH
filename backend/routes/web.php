<?php

use App\Http\Controllers\ChambreController;
use App\Http\Controllers\HotelController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\TarifController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TypeController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/booking', [HotelController::class, 'bookingPage'])->name('booking');
Route::get('/booking/verify/{reference}', [ReservationController::class, 'publicVerify'])
    ->name('booking.verify')
    ->middleware('signed');
Route::post('/booking/verify/{reference}/confirm', [ReservationController::class, 'publicConfirm'])
    ->name('booking.confirm')
    ->middleware('signed');
Route::put('/booking/verify/{reference}/update', [ReservationController::class, 'publicUpdate'])
    ->name('booking.update')
    ->middleware('signed');

// ----- Espace Administrateur (Back-Office) -----
Route::prefix('admin')->name('admin.')->group(function () {
    // Tableau de bord
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard'); 

    // Réservations
    Route::resource('reservations', ReservationController::class);
    Route::patch('reservations/{id}/statut', [ReservationController::class, 'updateStatut'])->name('reservations.updateStatut');
    Route::patch('reservations/{id}/payment-info', [ReservationController::class, 'updatePaymentInfo'])->name('reservations.updatePaymentInfo');
    Route::post('reservations/{id}/payment-link', [ReservationController::class, 'sendPaymentLink'])->name('reservations.sendPaymentLink');
    Route::post('reservations/{id}/add-payment', [ReservationController::class, 'addPayment'])->name('reservations.addPayment');
    Route::post('reservations/{id}/payment-proof', [ReservationController::class, 'uploadPaymentProof'])->name('reservations.uploadPaymentProof');

    // Gestion de l'Hôtel
    Route::resource('hotels', HotelController::class);
    Route::resource('chambres', ChambreController::class);
    Route::resource('types', TypeController::class);
    Route::resource('tarifs', TarifController::class);
});
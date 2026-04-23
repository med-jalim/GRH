<?php

use App\Http\Controllers\ChambreController;
use App\Http\Controllers\HotelController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\TarifController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TypeController;
use App\Http\Controllers\EmailTemplateController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;



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
Route::post('/booking/verify/{reference}/payment', [ReservationController::class, 'publicAddPayment'])
    ->name('booking.addPayment')
    ->middleware('signed');

Route::get('/booking/tarifs/{hotel}', [HotelController::class, 'getAdjustedTarifs'])->name('booking.tarifs');

// ----- Espace Administrateur (Back-Office) -----
Route::prefix('admin')->name('admin.')->group(function () {
    // Tableau de bord
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard'); 

    // Réservations
    Route::get('reservations/calendar-data', [ReservationController::class, 'getCalendarData'])->name('reservations.calendarData');
    Route::resource('reservations', ReservationController::class);
    Route::patch('reservations/{id}/statut', [ReservationController::class, 'updateStatut'])->name('reservations.updateStatut');
    Route::patch('reservations/{id}/payment-info', [ReservationController::class, 'updatePaymentInfo'])->name('reservations.updatePaymentInfo');
    Route::post('reservations/{id}/payment-link', [ReservationController::class, 'sendPaymentLink'])->name('reservations.sendPaymentLink');
    Route::post('reservations/{id}/add-payment', [ReservationController::class, 'addPayment'])->name('reservations.addPayment');
    Route::post('reservations/{id}/payment-proof', [ReservationController::class, 'uploadPaymentProof'])->name('reservations.uploadPaymentProof');

    // Gestion des paiements (Vérification)
    Route::patch('payments/{id}/verify', [ReservationController::class, 'verifyPayment'])->name('payments.verify');
    Route::patch('payments/{id}/reject', [ReservationController::class, 'rejectPayment'])->name('payments.reject');

    // Gestion de l'Hôtel
    Route::resource('hotels', HotelController::class);
    Route::put('hotels/{hotel}/pricing-rules', [HotelController::class, 'updatePricingRules'])->name('hotels.updatePricingRules');
    Route::put('hotels/{hotel}/type-capacities', [HotelController::class, 'updateTypeCapacities'])->name('hotels.updateTypeCapacities');
    Route::post('hotels/{hotel}/type-capacities/store', [HotelController::class, 'storeTypeCapacity'])->name('hotels.storeTypeCapacity');
    Route::put('hotels/{hotel}/type-capacities/{capacity}/update', [HotelController::class, 'updateTypeCapacityIndividual'])->name('hotels.updateTypeCapacityIndividual');
    Route::delete('hotels/{hotel}/type-capacities/{capacity}', [HotelController::class, 'deleteTypeCapacity'])->name('hotels.deleteTypeCapacity');
    Route::resource('chambres', ChambreController::class);
    Route::resource('types', TypeController::class);
    Route::resource('tarifs', TarifController::class);

    // Gestion des modèles d'e-mails
    Route::get('email-templates', [EmailTemplateController::class, 'index'])->name('email-templates.index');
    Route::get('email-templates/{emailTemplate}/edit', [EmailTemplateController::class, 'edit'])->name('email-templates.edit');
    Route::patch('email-templates/{emailTemplate}/draft', [EmailTemplateController::class, 'updateDraft'])->name('email-templates.draft');
    Route::post('email-templates/{emailTemplate}/publish', [EmailTemplateController::class, 'publish'])->name('email-templates.publish');
    Route::post('email-templates/{emailTemplate}/discard', [EmailTemplateController::class, 'discardDraft'])->name('email-templates.discard');
    Route::post('email-templates/{emailTemplate}/test', [EmailTemplateController::class, 'sendTest'])->name('email-templates.test');
    Route::post('email-templates/{emailTemplate}/preview', [EmailTemplateController::class, 'preview'])->name('email-templates.preview');

    // Settings
    Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('settings/global', [SettingsController::class, 'updateSettings'])->name('settings.updateGlobal');
    
    // Discounts (Hotel-specific)
    Route::post('hotels/{hotel}/discounts', [HotelController::class, 'storeDiscount'])->name('hotels.discounts.store');
    Route::put('hotels/{hotel}/discounts/{discount}', [HotelController::class, 'updateDiscount'])->name('hotels.discounts.update');
    Route::patch('hotels/{hotel}/discounts/{discount}/toggle', [HotelController::class, 'toggleDiscount'])->name('hotels.discounts.toggle');
    Route::delete('hotels/{hotel}/discounts/{discount}', [HotelController::class, 'deleteDiscount'])->name('hotels.discounts.delete');
});
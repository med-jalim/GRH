<?php

use App\Http\Controllers\ChambreController;
use App\Http\Controllers\HotelController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\TarifController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TypeController;
use App\Http\Controllers\PaymentVerificationController;
use App\Http\Controllers\ClientReservationController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/booking', [HotelController::class, 'bookingPage'])->name('booking');

// ----- Public Reservation Actions (via Token) -----
Route::get('/reservation/{token}', [ClientReservationController::class, 'show'])->name('reservation.show');
Route::get('/reservation/{token}/confirm', [ClientReservationController::class, 'confirm'])->name('reservation.confirm');
Route::get('/reservation/{token}/cancel', [ClientReservationController::class, 'cancel'])->name('reservation.cancel');
Route::post('/reservation/{token}/update', [ClientReservationController::class, 'update'])->name('reservation.update');
Route::post('/reservation/{token}/payments', [ClientReservationController::class, 'addPayment'])->name('reservation.addPayment');

// ----- Espace Authentification -----
Route::prefix('admin')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->name('admin.logout');
});

// ----- Espace Administrateur (Interdit aux non-connectés) -----
Route::prefix('admin')->name('admin.')->middleware('auth')->group(function () {
    // Tableau de bord
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard'); 

    // Réservations
    Route::resource('reservations', ReservationController::class);
    Route::patch('reservations/{id}/statut', [ReservationController::class, 'updateStatut'])->name('reservations.updateStatut');
    Route::post('reservations/{id}/payments', [PaymentVerificationController::class, 'store'])->name('reservations.payments.store');
    Route::patch('payments/{id}/statut', [PaymentVerificationController::class, 'updateStatut'])->name('reservations.payments.updateStatut');
    Route::delete('payments/{id}', [PaymentVerificationController::class, 'destroy'])->name('reservations.payments.destroy');

    // Gestion de l'Hôtel
    Route::resource('hotels', HotelController::class);
    Route::resource('chambres', ChambreController::class);
    Route::resource('types', TypeController::class);
    Route::resource('tarifs', TarifController::class);

    // Notifications
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.markAsRead');
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.markAllAsRead');

    // Email Templates
    Route::get('/email-templates', [\App\Http\Controllers\EmailTemplateController::class, 'index'])->name('email-templates.index');
    Route::get('/email-templates/{id}/edit', [\App\Http\Controllers\EmailTemplateController::class, 'edit'])->name('email-templates.edit');
    Route::patch('/email-templates/{id}', [\App\Http\Controllers\EmailTemplateController::class, 'update'])->name('email-templates.update');
});
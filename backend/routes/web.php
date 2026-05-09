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
use App\Http\Controllers\HotelTypeTarificationController;
use App\Http\Controllers\SubTypeController;
use App\Http\Controllers\Admin\SettingController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\BookingLinkController;


use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

Route::get('/booking', [HotelController::class, 'bookingPage'])->name('booking')->middleware('booking.access');
Route::post('/booking', [ReservationController::class, 'store'])->name('public.reservation.store');
Route::post('/booking/check-availability', [ReservationController::class, 'checkAvailabilityAjax'])->name('public.reservation.check');

// ----- Public Reservation Actions (via Token) -----
Route::get('/reservation/{token}', [ClientReservationController::class, 'show'])->name('reservation.show');
// ... other public routes ...
Route::post('/reservation/{token}/confirm', [ClientReservationController::class, 'confirm'])->name('reservation.confirm');
Route::post('/reservation/{token}/cancel', [ClientReservationController::class, 'cancel'])->name('reservation.cancel');
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
    Route::resource('sub_types', SubTypeController::class);
    Route::resource('tarifs', TarifController::class);

    // Tarification par chambre essentielle + pourcentages
    Route::post('hotels/{hotel}/tarification', [HotelTypeTarificationController::class, 'store'])->name('hotels.tarification.store');
    Route::delete('hotels/{hotel}/tarification', [HotelTypeTarificationController::class, 'destroy'])->name('hotels.tarification.destroy');

    // Notifications
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.markAsRead');
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.markAllAsRead');

    // Email Templates
    Route::get('/email-templates', [\App\Http\Controllers\EmailTemplateController::class, 'index'])->name('email-templates.index');
    Route::get('/email-templates/{id}/edit', [\App\Http\Controllers\EmailTemplateController::class, 'edit'])->name('email-templates.edit');
    Route::patch('/email-templates/{id}', [\App\Http\Controllers\EmailTemplateController::class, 'update'])->name('email-templates.update');

    // Paramètres
    Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('/settings/rules', [SettingController::class, 'storeRule'])->name('settings.rules.store');
    Route::patch('/settings/rules/{rule}', [SettingController::class, 'updateRule'])->name('settings.rules.update');
    Route::delete('/settings/rules/{rule}', [SettingController::class, 'deleteRule'])->name('settings.rules.destroy');
    Route::patch('/settings/update', [SettingController::class, 'updateSettings'])->name('settings.update');

    // Générateur de Liens
    Route::post('/generate-booking-link', [BookingLinkController::class, 'generate'])->name('generate-booking-link');
    Route::get('/booking-links', [BookingLinkController::class, 'index'])->name('booking-links.index');
});
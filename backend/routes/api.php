<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HotelController;
use App\Http\Controllers\ChambreController;
use App\Http\Controllers\TypeController;
use App\Http\Controllers\TarifController;
use App\Http\Controllers\ReservationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Configuration des Ressources API
Route::apiResource('hotels', HotelController::class);
Route::apiResource('chambres', ChambreController::class);
Route::apiResource('types', TypeController::class);
Route::apiResource('tarifs', TarifController::class);

// Gestion des Réservations
Route::apiResource('reservations', ReservationController::class);
Route::patch('reservations/{id}/statut', [ReservationController::class, 'updateStatut']);

// Route pour l'utilisateur authentifié (via Sanctum)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
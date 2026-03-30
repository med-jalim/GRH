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

// Les routes API ont été migrées vers web.php en tant que routes Inertia.

// Route pour l'utilisateur authentifié (via Sanctum)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
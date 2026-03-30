<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Fetch hotels with their types and prices
Route::get('/hotels', function () {
    return \App\Models\Hotel::with(['chambres.type', 'tarifs'])->get();
});

// Submit a booking request
Route::post('/reservations', function (Request $request) {
    // Placeholder for colleague to implement actual logic in a Controller
    return response()->json(['message' => 'Route ready for reservation logic'], 201);
});
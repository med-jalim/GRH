<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\BookingAccessToken;
use Symfony\Component\HttpFoundation\Response;

class VerifyBookingAccess
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Allow access to admin and other internal routes if needed, 
        // but here we specifically target the public /booking route.
        
        $token = $request->query('access');

        if (!$token) {
            return response()->view('errors.booking_denied', [], 403);
        }

        $isValid = BookingAccessToken::valid()->where('token', $token)->exists();

        if (!$isValid) {
            return response()->view('errors.booking_denied', ['reason' => 'Lien expiré ou invalide.'], 403);
        }

        return $next($request);
    }
}

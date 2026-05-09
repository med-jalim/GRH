<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BookingAccessToken;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BookingLinkController extends Controller
{
    /**
     * Generate a new secure booking link.
     */
    public function generate(Request $request)
    {
        $token = Str::random(32);
        
        $access = BookingAccessToken::create([
            'token' => $token,
            'expires_at' => now()->addHours(48),
            'client_name' => $request->input('client_name'),
        ]);

        $url = url("/booking?access=" . $token);

        return response()->json([
            'success' => true,
            'link' => $url,
            'token' => $token,
            'expires_at' => $access->expires_at->toDateTimeString(),
        ]);
    }

    /**
     * Optional: List recent tokens.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'tokens' => BookingAccessToken::latest()->limit(10)->get(),
        ]);
    }
}

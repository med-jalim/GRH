<?php

namespace App\Http\Controllers;

use App\Models\GlobalSetting;
use App\Models\Discount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = [
            'min_rooms' => GlobalSetting::get('min_rooms', 1),
        ];

        return Inertia::render('Admin/Settings/Index', [
            'settings'  => $settings,
        ]);
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'min_rooms' => 'required|integer|min:1',
        ]);

        foreach ($validated as $key => $value) {
            GlobalSetting::set($key, $value);
        }

        return back()->with('success', 'Paramètres mis à jour avec succès.');
    }
}

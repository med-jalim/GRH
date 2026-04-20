<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\DiscountRule;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Settings/Index', [
            'settings' => AppSetting::all(),
            'rules'    => DiscountRule::whereNull('id_hotel')->orderBy('min_nights')->get(),
        ]);
    }

    public function storeRule(Request $request)
    {
        $validated = $request->validate([
            'id_hotel'            => 'nullable|exists:hotels,id',
            'min_nights'          => [
                'required',
                'integer',
                'min:1',
                Rule::unique('discount_rules', 'min_nights')->where(function ($query) use ($request) {
                    return $query->where('id_hotel', $request->id_hotel);
                }),
            ],
            'discount_percentage' => 'required|numeric|min:0|max:100',
        ]);

        DiscountRule::create($validated);

        return redirect()->back()->with('success', 'Règle de remise ajoutée avec succès.');
    }

    public function updateRule(Request $request, DiscountRule $rule)
    {
        $validated = $request->validate([
            'min_nights'          => [
                'required',
                'integer',
                'min:1',
                Rule::unique('discount_rules', 'min_nights')
                    ->where(function ($query) use ($rule) {
                        return $query->where('id_hotel', $rule->id_hotel);
                    })
                    ->ignore($rule->id),
            ],
            'discount_percentage' => 'required|numeric|min:0|max:100',
        ]);

        $rule->update($validated);

        return redirect()->back()->with('success', 'Règle de remise mise à jour.');
    }

    public function deleteRule(DiscountRule $rule)
    {
        $rule->delete();
        return redirect()->back()->with('success', 'Règle de remise supprimée.');
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key'   => 'required|string|exists:app_settings,key',
            'settings.*.value' => 'required',
        ]);

        foreach ($validated['settings'] as $item) {
            AppSetting::where('key', $item['key'])->update(['value' => $item['value']]);
        }

        return redirect()->back()->with('success', 'Paramètres mis à jour avec succès.');
    }
}

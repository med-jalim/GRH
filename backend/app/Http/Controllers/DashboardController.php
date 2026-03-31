<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Reservation;
use App\Models\Hotel;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. إحصائيات علوية (Top Level Stats)
        $bookedRooms = Reservation::where('statut', 'confirmée')->count();
        $cancelledRooms = Reservation::where('statut', 'annulée')->count();
        
        $totalRevenue = Reservation::where('statut', 'confirmée')->sum('prix_total');
        $pendingReservations = Reservation::where('statut', 'en_attente')->count();

        // 2. نظرة عامة شهرية (Campaign Overview) - إحصائية الحجوزات 
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            // For monthly chart
            $months[] = Carbon::now()->subMonths($i)->format('n'); // 'n' for 1-12 without leading zero
        }

        $monthlyData = Reservation::select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(id) as total_booked'),
                DB::raw('SUM(CASE WHEN statut = "confirmée" THEN 1 ELSE 0 END) as total_confirmed')
            )
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $campaignOverview = [];
        $monthNames = [1 => 'Jan', 2 => 'Fév', 3 => 'Mar', 4 => 'Avr', 5 => 'Mai', 6 => 'Juin', 7 => 'Juil', 8 => 'Aoû', 9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc'];
        
        foreach ($months as $m) {
            $data = $monthlyData->firstWhere('month', $m);
            $campaignOverview[] = [
                'name' => $monthNames[(int)$m] ?? $m,
                'Booked' => $data ? $data->total_booked : 0,
                'Visited' => $data ? $data->total_confirmed : 0, 
            ];
        }

        // 3. أفضل الفنادق من حيث الحجوزات (Progress Bars Section)
        $topHotels = Reservation::select('id_hotel', DB::raw('COUNT(id) as total_reservations'))
            ->with('hotel:id,name')
            ->groupBy('id_hotel')
            ->orderByDesc('total_reservations')
            ->limit(3)
            ->get()
            ->map(function ($res) {
                return [
                    'name' => $res->hotel ? $res->hotel->name : 'Hôtel inconnu',
                    'total' => $res->total_reservations,
                    'percentage' => Reservation::count() > 0 ? round(($res->total_reservations / Reservation::count()) * 100) : 0,
                ];
            });

        // 4. المخطط الدائري للحالات (Revenue Stat)
        $statusDistribution = [
            ['name' => 'Confirmée', 'value' => $bookedRooms, 'fill' => '#4ade80'], // Green
            ['name' => 'En attente', 'value' => $pendingReservations, 'fill' => '#fbbf24'], // Yellow
            ['name' => 'Annulée', 'value' => $cancelledRooms, 'fill' => '#f87171'], // Red
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'booked' => $bookedRooms,
                'cancelled' => $cancelledRooms,
                'revenue' => $totalRevenue,
                'pending' => $pendingReservations,
            ],
            'chartData' => $campaignOverview,
            'topHotels' => $topHotels,
            'statusDistribution' => $statusDistribution,
        ]);
    }
}

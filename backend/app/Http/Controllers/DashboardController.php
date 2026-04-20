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
    /**
     * Get date range (start, end) for current period and previous period.
     */
    private function getDateRanges(string $period): array
    {
        $now = Carbon::now();

        switch ($period) {
            case 'today':
                $start    = $now->copy()->startOfDay();
                $end      = $now->copy()->endOfDay();
                $prevStart = $now->copy()->subDay()->startOfDay();
                $prevEnd   = $now->copy()->subDay()->endOfDay();
                break;
            case 'this_week':
                $start    = $now->copy()->startOfWeek();
                $end      = $now->copy()->endOfWeek();
                $prevStart = $now->copy()->subWeek()->startOfWeek();
                $prevEnd   = $now->copy()->subWeek()->endOfWeek();
                break;
            case 'this_year':
                $start    = $now->copy()->startOfYear();
                $end      = $now->copy()->endOfYear();
                $prevStart = $now->copy()->subYear()->startOfYear();
                $prevEnd   = $now->copy()->subYear()->endOfYear();
                break;
            case 'all':
                $start    = Carbon::createFromDate(2000, 1, 1)->startOfDay();
                $end      = $now->copy()->endOfDay();
                $prevStart = null;
                $prevEnd   = null;
                break;
            case 'this_month':
            default:
                $start    = $now->copy()->startOfMonth();
                $end      = $now->copy()->endOfMonth();
                $prevStart = $now->copy()->subMonth()->startOfMonth();
                $prevEnd   = $now->copy()->subMonth()->endOfMonth();
                break;
        }

        return compact('start', 'end', 'prevStart', 'prevEnd');
    }

    /**
     * Calculate percentage change between two values.
     */
    private function pctChange($current, $previous): ?float
    {
        if ($previous === null) return null;
        if ($previous == 0) return $current > 0 ? 100.0 : 0.0;
        return round((($current - $previous) / $previous) * 100, 1);
    }

    /**
     * Build base query scope with date + hotel filters.
     */
    private function baseQuery(Carbon $start, Carbon $end, ?int $hotelId, ?string $dateColumn = 'created_at')
    {
        $q = Reservation::whereBetween($dateColumn, [$start, $end]);
        if ($hotelId) {
            $q->where('id_hotel', $hotelId);
        }
        return $q;
    }

    public function index(Request $request)
    {
        $period  = $request->input('period', 'this_month');
        $hotelId = $request->input('hotel_id') ? (int) $request->input('hotel_id') : null;

        ['start' => $start, 'end' => $end, 'prevStart' => $prevStart, 'prevEnd' => $prevEnd] = $this->getDateRanges($period);

        // Statuts confirmés par l'admin (revenus réels)
        $confirmedStatuts = ['confirme', 'valide', 'partiellement_paye'];
        $pendingStatuts   = ['en_attente', 'en_validation', 'en_attente_paiement'];

        // ── Période courante ──────────────────────────────────────────────────
        $curBase = $this->baseQuery($start, $end, $hotelId);

        // Total réservations (toutes)
        $curBooked = (clone $curBase)->count();

        // Annulées
        $curCancelled = (clone $curBase)->where('statut', 'annule')->count();

        // En attente
        $curPending = (clone $curBase)->where('statut', 'en_attente')->count();

        // Revenu payé : somme de paid_amount sur les réservations confirmées
        $curRevenuePaid = (clone $curBase)
            ->whereIn('statut', $confirmedStatuts)
            ->sum('paid_amount');

        // Revenu attendu : total_amount - paid_amount sur les réservations confirmées
        $curRevenueExpected = (clone $curBase)
            ->whereIn('statut', $confirmedStatuts)
            ->selectRaw('SUM(total_amount - paid_amount) as expected')
            ->value('expected') ?? 0;

        // ── Période précédente ────────────────────────────────────────────────
        $prevBooked          = null;
        $prevCancelled       = null;
        $prevPending         = null;
        $prevRevenuePaid     = null;
        $prevRevenueExpected = null;

        if ($prevStart && $prevEnd) {
            $prevBase = $this->baseQuery($prevStart, $prevEnd, $hotelId);

            $prevBooked    = (clone $prevBase)->count();
            $prevCancelled = (clone $prevBase)->where('statut', 'annule')->count();
            $prevPending   = (clone $prevBase)->whereIn('statut', $pendingStatuts)->count();

            $prevRevenuePaid = (clone $prevBase)
                ->whereIn('statut', $confirmedStatuts)
                ->sum('paid_amount');

            $prevRevenueExpected = (clone $prevBase)
                ->whereIn('statut', $confirmedStatuts)
                ->selectRaw('SUM(total_amount - paid_amount) as expected')
                ->value('expected') ?? 0;
        }

        // ── Graphique linéaire (Line Chart) ───────────────────────────────────
        $chartData = $this->buildChartData($period, $start, $end, $hotelId);

        // ── Meilleurs Hôtels ─────────────────────────────────────────────────
        $topHotels = $this->buildTopHotels($start, $end, $hotelId);

        // ── Distribution des Revenus (Donut financier) ───────────────────────
        // Réservations confirmées par l'admin = source de vérité financière
        $confirmedBase = (clone $curBase)->whereIn('statut', $confirmedStatuts);

        // 1. Encaissé intégralement (confirme / valide, paid >= total)
        $paidFull = (clone $curBase)
            ->whereIn('statut', ['confirme', 'valide'])
            ->whereRaw('paid_amount >= total_amount AND total_amount > 0')
            ->sum('paid_amount');

        // 2. Partiellement encaissé (partiellement_paye)
        $paidPartial = (clone $curBase)
            ->where('statut', 'partiellement_paye')
            ->sum('paid_amount');

        // 3. Encore dû (total_amount - paid_amount de toutes les réservations confirmées)
        $stillDue = (float) ((clone $confirmedBase)
            ->selectRaw('SUM(total_amount - paid_amount) as due')
            ->value('due') ?? 0);

        // Total attendu = somme de tous les total_amount des réservations confirmées
        $totalRevenueBrut = (float) ((clone $confirmedBase)->sum('total_amount'));

        $revenueDistribution = [
            ['name' => 'Encaissé',         'value' => (float) $paidFull,    'fill' => '#4ade80'],
            ['name' => 'Partiel encaissé', 'value' => (float) $paidPartial, 'fill' => '#60a5fa'],
            ['name' => 'Encore dû',        'value' => $stillDue,            'fill' => '#f87171'],
        ];

        // ── Hotels list pour le filtre ────────────────────────────────────────
        $hotels = Hotel::select('id', 'name')->orderBy('name')->get();

        $curConfirmed = (clone $curBase)->whereIn('statut', $confirmedStatuts)->count();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'booked'           => $curBooked,
                'confirmed'        => $curConfirmed,
                'cancelled'        => $curCancelled,
                'revenue'          => (float) $curRevenuePaid,
                'expected_revenue' => (float) $curRevenueExpected,
                'total_revenue'    => $totalRevenueBrut,
                'pending'          => $curPending,
                // Comparaisons
                'booked_change'           => $this->pctChange($curBooked, $prevBooked),
                'cancelled_change'        => $this->pctChange($curCancelled, $prevCancelled),
                'revenue_change'          => $this->pctChange($curRevenuePaid, $prevRevenuePaid),
                'expected_revenue_change' => $this->pctChange($curRevenueExpected, $prevRevenueExpected),
                'pending_change'          => $this->pctChange($curPending, $prevPending),
            ],
            'chartData'           => $chartData,
            'topHotels'           => $topHotels,
            'revenueDistribution' => $revenueDistribution,
            'hotels'              => $hotels,
            'filters'             => [
                'period'   => $period,
                'hotel_id' => $hotelId,
            ],
        ]);
    }

    private function buildChartData(string $period, Carbon $start, Carbon $end, ?int $hotelId): array
    {
        $monthNames = [1 => 'Jan', 2 => 'Fév', 3 => 'Mar', 4 => 'Avr', 5 => 'Mai', 6 => 'Juin', 7 => 'Juil', 8 => 'Aoû', 9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc'];
        $dayNames   = [0 => 'Dim', 1 => 'Lun', 2 => 'Mar', 3 => 'Mer', 4 => 'Jeu', 5 => 'Ven', 6 => 'Sam'];

        // Build base query for chart
        $query = Reservation::whereBetween('created_at', [$start, $end]);
        if ($hotelId) {
            $query->where('id_hotel', $hotelId);
        }

        $confirmedStatuts = ['confirme', 'valide', 'partiellement_paye'];

        if ($period === 'this_week') {
            // Par jour de la semaine courante
            $raw = (clone $query)
                ->select(
                    DB::raw('DAYOFWEEK(created_at) - 1 as dow'),
                    DB::raw('DATE(created_at) as day_date'),
                    DB::raw('COUNT(id) as total_booked'),
                    DB::raw('SUM(CASE WHEN statut IN ("confirme","valide","partiellement_paye") THEN 1 ELSE 0 END) as total_confirmed')
                )
                ->groupBy('dow', 'day_date')
                ->orderBy('day_date')
                ->get()
                ->keyBy('day_date');

            $chart = [];
            $cursor = $start->copy();
            while ($cursor->lte($end)) {
                $key  = $cursor->toDateString();
                $data = $raw->get($key);
                $chart[] = [
                    'name'    => $dayNames[$cursor->dayOfWeek],
                    'Booked'  => $data ? (int) $data->total_booked : 0,
                    'Visited' => $data ? (int) $data->total_confirmed : 0,
                ];
                $cursor->addDay();
            }
            return $chart;

        } elseif ($period === 'this_month') {
            // Par jour du mois
            $raw = (clone $query)
                ->select(
                    DB::raw('DAY(created_at) as day'),
                    DB::raw('COUNT(id) as total_booked'),
                    DB::raw('SUM(CASE WHEN statut IN ("confirme","valide","partiellement_paye") THEN 1 ELSE 0 END) as total_confirmed')
                )
                ->groupBy('day')
                ->orderBy('day')
                ->get()
                ->keyBy('day');

            $chart = [];
            for ($d = 1; $d <= $end->day; $d++) {
                $data = $raw->get($d);
                $chart[] = [
                    'name'    => (string) $d,
                    'Booked'  => $data ? (int) $data->total_booked : 0,
                    'Visited' => $data ? (int) $data->total_confirmed : 0,
                ];
            }
            return $chart;

        } elseif ($period === 'today') {
            // Par heure
            $raw = (clone $query)
                ->select(
                    DB::raw('HOUR(created_at) as hour'),
                    DB::raw('COUNT(id) as total_booked'),
                    DB::raw('SUM(CASE WHEN statut IN ("confirme","valide","partiellement_paye") THEN 1 ELSE 0 END) as total_confirmed')
                )
                ->groupBy('hour')
                ->orderBy('hour')
                ->get()
                ->keyBy('hour');

            $chart = [];
            for ($h = 0; $h <= 23; $h++) {
                $data = $raw->get($h);
                $chart[] = [
                    'name'    => sprintf('%02dh', $h),
                    'Booked'  => $data ? (int) $data->total_booked : 0,
                    'Visited' => $data ? (int) $data->total_confirmed : 0,
                ];
            }
            return $chart;

        } else {
            // Par mois (this_year ou all) — on utilise les 12 derniers mois pour "all"
            if ($period === 'all') {
                $start = Carbon::now()->subMonths(11)->startOfMonth();
                $end   = Carbon::now()->endOfMonth();
                // Rebuild query for adjusted range
                $query = Reservation::whereBetween('created_at', [$start, $end]);
                if ($hotelId) $query->where('id_hotel', $hotelId);
            }

            $raw = (clone $query)
                ->select(
                    DB::raw('YEAR(created_at) as year'),
                    DB::raw('MONTH(created_at) as month'),
                    DB::raw('COUNT(id) as total_booked'),
                    DB::raw('SUM(CASE WHEN statut IN ("confirme","valide","partiellement_paye") THEN 1 ELSE 0 END) as total_confirmed')
                )
                ->groupBy('year', 'month')
                ->orderBy('year')->orderBy('month')
                ->get()
                ->keyBy(fn($r) => $r->year . '-' . $r->month);

            $chart = [];
            $cursor = $start->copy()->startOfMonth();
            while ($cursor->lte($end)) {
                $key  = $cursor->year . '-' . $cursor->month;
                $data = $raw->get($key);
                $chart[] = [
                    'name'    => $monthNames[$cursor->month] . ' ' . $cursor->year,
                    'Booked'  => $data ? (int) $data->total_booked : 0,
                    'Visited' => $data ? (int) $data->total_confirmed : 0,
                ];
                $cursor->addMonth();
            }
            return $chart;
        }
    }

    private function buildTopHotels(Carbon $start, Carbon $end, ?int $hotelId): array
    {
        $query = Reservation::whereBetween('created_at', [$start, $end]);
        if ($hotelId) {
            $query->where('id_hotel', $hotelId);
        }

        $totalInPeriod = (clone $query)->count();

        return (clone $query)
            ->select(
                'id_hotel',
                DB::raw('COUNT(id) as total_reservations'),
                DB::raw("SUM(CASE WHEN statut IN ('confirme', 'valide', 'partiellement_paye') THEN 1 ELSE 0 END) as confirmed"),
                DB::raw("SUM(CASE WHEN statut IN ('en_attente', 'pre_reserve') THEN 1 ELSE 0 END) as pending"),
                DB::raw("SUM(CASE WHEN statut = 'annule' THEN 1 ELSE 0 END) as cancelled")
            )
            ->with('hotel:id,name')
            ->groupBy('id_hotel')
            ->orderByDesc('total_reservations')
            ->limit(5)
            ->get()
            ->map(function ($res) use ($totalInPeriod) {
                $total     = (int) $res->total_reservations;
                $confirmed = (int) $res->confirmed;
                $pending   = (int) $res->pending;
                $cancelled = (int) $res->cancelled;
                return [
                    'name'           => $res->hotel ? $res->hotel->name : 'Hôtel inconnu',
                    'total'          => $total,
                    'percentage'     => $totalInPeriod > 0 ? round(($total / $totalInPeriod) * 100) : 0,
                    'confirmed'      => $confirmed,
                    'pending'        => $pending,
                    'cancelled'      => $cancelled,
                    'confirmed_pct'  => $total > 0 ? round(($confirmed / $total) * 100) : 0,
                    'pending_pct'    => $total > 0 ? round(($pending   / $total) * 100) : 0,
                    'cancelled_pct'  => $total > 0 ? round(($cancelled / $total) * 100) : 0,
                ];
            })
            ->toArray();
    }
}

import { AdminLayout } from "@/Layouts/AdminLayout";
import {
    Building2,
    CalendarDays,
    TrendingUp,
    Users,
    Filter,
    ArrowUpDown,
    ChevronDown,
    TrendingDown,
    Hotel,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { router } from "@inertiajs/react";
import { BookingLinkGenerator } from "@/components/Admin/BookingLinkGenerator";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

// ─── Interfaces ────────────────────────────────────────────────────────────────

interface StatData {
    booked: number;
    confirmed: number;
    cancelled: number;
    revenue: number;
    expected_revenue: number;
    total_revenue: number;
    pending: number;
    booked_change: number | null;
    cancelled_change: number | null;
    revenue_change: number | null;
    expected_revenue_change: number | null;
    pending_change: number | null;
}

interface ChartData {
    name: string;
    Booked: number;
    Visited: number;
}

interface TopHotel {
    name: string;
    total: number;
    percentage: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    confirmed_pct: number;
    pending_pct: number;
    cancelled_pct: number;
}

interface RevenueDist {
    name: string;
    value: number;
    fill: string;
}

interface HotelOption {
    id: number;
    name: string;
}

interface Filters {
    period: string;
    hotel_id: number | null;
}

interface Props {
    stats: StatData;
    chartData: ChartData[];
    topHotels: TopHotel[];
    revenueDistribution: RevenueDist[];
    hotels: HotelOption[];
    filters: Filters;
}

// ─── Dropdown Component ─────────────────────────────────────────────────────────

function Dropdown({
    trigger,
    children,
}: {
    trigger: React.ReactNode;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div ref={ref} className="relative">
            <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
            {open && (
                <div
                    className="absolute right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 min-w-[180px] py-1 overflow-hidden"
                    onClick={() => setOpen(false)}
                >
                    {children}
                </div>
            )}
        </div>
    );
}

// ─── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({
    title,
    value,
    change,
    icon: Icon,
    colorClass,
    bgClass,
    gradient,
}: {
    title: string;
    value: string;
    change: number | null;
    icon: React.ElementType;
    colorClass: string;
    bgClass: string;
    gradient: string;
}) {
    const isPositive = change !== null && change >= 0;
    const noData = change === null;

    // Cap extreme values for display
    const displayChange = change === null
        ? null
        : Math.abs(change) > 999
            ? (change > 0 ? 999 : -999)
            : change;
    const isCapped = change !== null && Math.abs(change) > 999;

    return (
        <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-all duration-200 group">
            {/* Accent bar */}
            <div className={`absolute top-0 left-0 w-1 h-full ${gradient}`} />

            {/* Main content */}
            <div className="pl-4 pr-4 pt-5 pb-4 flex flex-col gap-3">
                {/* Icon row */}
                <div className="flex justify-between items-start">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bgClass} ring-1 ring-inset ring-black/5`}>
                        <Icon className={`w-4 h-4 ${colorClass}`} />
                    </div>
                    {/* Tiny trend pill */}
                    {!noData && (
                        <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isPositive
                                ? "text-emerald-700 bg-emerald-50"
                                : "text-red-600 bg-red-50"
                        }`}>
                            {isPositive ? "▲" : "▼"}
                            {" "}{isCapped ? "999+": Math.abs(displayChange!)}%
                        </span>
                    )}
                </div>

                {/* Value */}
                <div>
                    <p className="text-[22px] font-black text-gray-900 tracking-tight leading-none break-all">
                        {value}
                    </p>
                    <p className="text-[11px] font-semibold text-gray-400 mt-1.5 uppercase tracking-widest">
                        {title}
                    </p>
                </div>
            </div>

            {/* Bottom strip */}
            <div className={`mx-3 mb-3 rounded-xl px-3 py-2 flex items-center justify-between ${
                noData
                    ? "bg-gray-50"
                    : isPositive
                        ? "bg-emerald-50"
                        : "bg-red-50"
            }`}>
                <span className={`text-[10px] font-semibold uppercase tracking-wide ${
                    noData ? "text-gray-400" : isPositive ? "text-emerald-600" : "text-red-500"
                }`}>
                    {noData ? "Toutes périodes" : "vs période préc."}
                </span>
                {!noData && (
                    <span className={`flex items-center gap-0.5 text-xs font-black ${
                        isPositive ? "text-emerald-700" : "text-red-600"
                    }`}>
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {isPositive ? "+" : ""}{isCapped ? `${change! > 0 ? "+" : ""}999%+` : `${displayChange}%`}
                    </span>
                )}
            </div>
        </div>
    );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard({
    stats,
    chartData,
    topHotels,
    revenueDistribution,
    hotels,
    filters,
}: Props) {
    const periodOptions = [
        { value: "today", label: "Aujourd'hui" },
        { value: "this_week", label: "Cette Semaine" },
        { value: "this_month", label: "Ce Mois" },
        { value: "this_year", label: "Cette Année" },
        { value: "all", label: "Tout le temps" },
    ];

    const currentPeriodLabel =
        periodOptions.find((p) => p.value === filters.period)?.label ??
        "Ce Mois";

    const currentHotelLabel =
        hotels.find((h) => h.id === filters.hotel_id)?.name ?? "Tous les Hôtels";

    function applyFilter(params: Partial<Filters>) {
        router.get(
            "/admin/dashboard",
            { ...filters, ...params },
            { preserveState: true, preserveScroll: true }
        );
    }

    const barColors = [
        { bar: "bg-green-500", text: "text-green-600" },
        { bar: "bg-blue-500", text: "text-blue-600" },
        { bar: "bg-purple-500", text: "text-purple-600" },
        { bar: "bg-amber-400", text: "text-amber-600" },
        { bar: "bg-rose-400", text: "text-rose-600" },
    ];

    const totalRevenueBrut = stats.total_revenue ?? 0;

    return (
        <AdminLayout>
            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        Bonjour ! <span className="text-2xl">👋</span>
                    </h1>
                    <p className="text-sm text-gray-400 mt-1 font-medium">
                        Période affichée :{" "}
                        <span className="text-gray-700">{currentPeriodLabel}</span>
                        {filters.hotel_id && (
                            <>
                                {" · "}
                                <span className="text-gray-700">
                                    {currentHotelLabel}
                                </span>
                            </>
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Period Filter */}
                    <Dropdown
                        trigger={
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
                                <CalendarDays className="w-4 h-4 text-gray-400" />
                                {currentPeriodLabel}
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>
                        }
                    >
                        {periodOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() =>
                                    applyFilter({ period: opt.value })
                                }
                                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 ${
                                    filters.period === opt.value
                                        ? "text-green-600 bg-green-50"
                                        : "text-gray-700"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </Dropdown>

                    {/* Hotel Filter */}
                    <Dropdown
                        trigger={
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
                                <Hotel className="w-4 h-4 text-gray-400" />
                                {currentHotelLabel}
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>
                        }
                    >
                        <button
                            onClick={() => applyFilter({ hotel_id: null })}
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 ${
                                !filters.hotel_id
                                    ? "text-green-600 bg-green-50"
                                    : "text-gray-700"
                            }`}
                        >
                            Tous les Hôtels
                        </button>
                        {hotels.map((h) => (
                            <button
                                key={h.id}
                                onClick={() =>
                                    applyFilter({ hotel_id: h.id })
                                }
                                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 ${
                                    filters.hotel_id === h.id
                                        ? "text-green-600 bg-green-50"
                                        : "text-gray-700"
                                }`}
                            >
                                {h.name}
                            </button>
                        ))}
                    </Dropdown>


                    {/* Active filter badge */}
                    {(filters.hotel_id || filters.period !== "this_month") && (
                        <button
                            onClick={() =>
                                applyFilter({
                                    period: "this_month",
                                    hotel_id: null,
                                })
                            }
                            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-600 hover:bg-red-100 transition-colors shadow-sm"
                        >
                            <Filter className="w-4 h-4" />
                            Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {/* ── Main Grid ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Left Column ───────────────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Line Chart */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Aperçu des Réservations
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {currentPeriodLabel}
                                    {filters.hotel_id
                                        ? ` · ${currentHotelLabel}`
                                        : ""}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                                    <span className="text-xs text-gray-500">
                                        Total
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                                    <span className="text-xs text-gray-500">
                                        Confirmées
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData || []}
                                    margin={{
                                        top: 5,
                                        right: 20,
                                        bottom: 5,
                                        left: 0,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#f3f4f6"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#9ca3af", fontSize: 11 }}
                                        dy={10}
                                        interval={
                                            chartData.length > 15
                                                ? Math.floor(
                                                      chartData.length / 10
                                                  )
                                                : 0
                                        }
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#9ca3af", fontSize: 11 }}
                                        dx={-10}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "none",
                                            boxShadow:
                                                "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                        }}
                                        cursor={{
                                            stroke: "#f3f4f6",
                                            strokeWidth: 2,
                                        }}
                                    />
                                    <Line
                                        name="Toutes les réservations"
                                        type="monotone"
                                        dataKey="Booked"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        name="Confirmées"
                                        type="monotone"
                                        dataKey="Visited"
                                        stroke="#f59e0b"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Hotels + quick summary */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-900">
                                Meilleurs Hôtels
                            </h2>
                            <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                {currentPeriodLabel}
                            </span>
                        </div>

                        {/* Mini summary */}
                        <div className="flex gap-3 mb-6">
                            {/* Confirmées */}
                            <div className="bg-green-50 px-4 py-3 rounded-xl flex-1 border border-green-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 block flex-shrink-0" />
                                    <p className="text-xl font-bold text-green-700">
                                        {stats?.confirmed}
                                    </p>
                                </div>
                                <p className="text-xs text-gray-500 font-medium">
                                    Confirmées
                                </p>
                            </div>
                            {/* En attente */}
                            <div className="bg-amber-50 px-4 py-3 rounded-xl flex-1 border border-amber-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block flex-shrink-0" />
                                    <p className="text-xl font-bold text-amber-600">
                                        {stats?.pending}
                                    </p>
                                </div>
                                <p className="text-xs text-gray-500 font-medium">
                                    En attente
                                </p>
                            </div>
                            {/* Annulées */}
                            <div className="bg-red-50 px-4 py-3 rounded-xl flex-1 border border-red-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 block flex-shrink-0" />
                                    <p className="text-xl font-bold text-red-500">
                                        {stats?.cancelled}
                                    </p>
                                </div>
                                <p className="text-xs text-gray-500 font-medium">
                                    Annulées
                                </p>
                            </div>
                        </div>


                        {/* Stacked bars */}
                        <div className="space-y-5">
                            {topHotels?.map((hotel) => (
                                <div key={hotel.name}>
                                    {/* Header row */}
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-semibold text-gray-700 truncate max-w-[55%]">
                                            {hotel.name}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {hotel.total} rés. ·{" "}
                                            <span className="font-semibold text-gray-600">
                                                {hotel.percentage}% du total
                                            </span>
                                        </span>
                                    </div>

                                    {/* Stacked bar */}
                                    <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-100">
                                        {hotel.confirmed_pct > 0 && (
                                            <div
                                                className="h-full bg-green-500 transition-all duration-700"
                                                style={{ width: `${hotel.confirmed_pct}%` }}
                                                title={`Confirmées : ${hotel.confirmed}`}
                                            />
                                        )}
                                        {hotel.pending_pct > 0 && (
                                            <div
                                                className="h-full bg-amber-400 transition-all duration-700"
                                                style={{ width: `${hotel.pending_pct}%` }}
                                                title={`En attente : ${hotel.pending}`}
                                            />
                                        )}
                                        {hotel.cancelled_pct > 0 && (
                                            <div
                                                className="h-full bg-red-400 transition-all duration-700"
                                                style={{ width: `${hotel.cancelled_pct}%` }}
                                                title={`Annulées : ${hotel.cancelled}`}
                                            />
                                        )}
                                    </div>

                                    {/* Mini legend */}
                                    <div className="flex gap-3 mt-1.5">
                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                                            {hotel.confirmed} confirmées
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                                            {hotel.pending} en attente
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                                            {hotel.cancelled} annulées
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {(!topHotels || topHotels.length === 0) && (
                                <div className="text-center text-sm text-gray-400 py-8">
                                    <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                                    Aucune réservation sur cette période.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Right Column ──────────────────────────────────────────── */}
                <div className="space-y-6">
                    {/* Booking Link Generator */}
                    <BookingLinkGenerator />

                    {/* 4 Stat Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard
                            title="Total Réservations"
                            value={stats.booked.toLocaleString("fr-MA")}
                            change={stats.booked_change}
                            icon={CalendarDays}
                            colorClass="text-emerald-600"
                            bgClass="bg-emerald-50"
                            gradient="bg-gradient-to-b from-emerald-400 to-emerald-600"
                        />
                        <StatCard
                            title="Annulées"
                            value={stats.cancelled.toLocaleString("fr-MA")}
                            change={
                                stats.cancelled_change !== null
                                    ? -stats.cancelled_change
                                    : null
                            }
                            icon={Users}
                            colorClass="text-amber-500"
                            bgClass="bg-amber-50"
                            gradient="bg-gradient-to-b from-amber-300 to-amber-500"
                        />
                        <StatCard
                            title="Revenu Perçu"
                            value={`${stats.revenue.toLocaleString("fr-MA")} MAD`}
                            change={stats.revenue_change}
                            icon={Building2}
                            colorClass="text-blue-500"
                            bgClass="bg-blue-50"
                            gradient="bg-gradient-to-b from-blue-400 to-blue-600"
                        />
                        <StatCard
                            title="Reste à Percevoir"
                            value={`${stats.expected_revenue.toLocaleString("fr-MA")} MAD`}
                            change={stats.expected_revenue_change}
                            icon={TrendingUp}
                            colorClass="text-purple-500"
                            bgClass="bg-purple-50"
                            gradient="bg-gradient-to-b from-purple-400 to-purple-600"
                        />
                    </div>

                    {/* Donut — Distribution Financière */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[390px]">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Répartition Financière
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Revenus des réservations confirmées
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={revenueDistribution || []}
                                        cx="50%"
                                        cy="60%"
                                        startAngle={180}
                                        endAngle={0}
                                        innerRadius={75}
                                        outerRadius={105}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {revenueDistribution?.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.fill}
                                                />
                                            )
                                        )}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Center — Total brut */}
                            <div className="absolute top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                <p className="text-[10px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">
                                    Total Attendu
                                </p>
                                <p className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                                    {totalRevenueBrut.toLocaleString("fr-MA")}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5 font-medium">
                                    MAD
                                </p>
                            </div>
                        </div>

                        {/* Legend with MAD amounts */}
                        <div className="flex flex-col gap-2 mt-2 mb-4">
                            {revenueDistribution?.map((seg) => {
                                const pct =
                                    totalRevenueBrut > 0
                                        ? Math.round(
                                              (seg.value / totalRevenueBrut) * 100
                                          )
                                        : 0;
                                return (
                                    <div
                                        key={seg.name}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: seg.fill }}
                                            />
                                            <span className="text-xs font-medium text-gray-500">
                                                {seg.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-700">
                                                {seg.value.toLocaleString("fr-MA")} MAD
                                            </span>
                                            <span className="text-xs text-gray-400">({pct}%)</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Revenue banner */}
                        <div className="mt-auto bg-green-50 rounded-xl p-3 flex items-center gap-3">
                            <span className="text-green-600 text-xs font-bold px-2 py-1 bg-green-100 rounded-md shrink-0">
                                {stats.revenue_change !== null
                                    ? `${stats.revenue_change >= 0 ? "+" : ""}${stats.revenue_change}%`
                                    : "—"}
                            </span>
                            <p className="text-xs font-medium text-gray-600">
                                Encaissé :{" "}
                                <span className="text-gray-900 font-bold">
                                    {stats.revenue.toLocaleString("fr-MA")} MAD
                                </span>{" "}
                                vs période précédente
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

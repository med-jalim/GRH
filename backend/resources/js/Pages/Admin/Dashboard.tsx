import { AdminLayout } from "@/Layouts/AdminLayout";
import {
    Building2,
    CalendarDays,
    TrendingUp,
    Users,
    Settings,
    Filter,
    ArrowUpDown,
    Calendar,
    MoreHorizontal,
} from "lucide-react";
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

interface StatData {
    booked: number;
    cancelled: number;
    revenue: number;
    pending: number;
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
}

interface StatusDist {
    name: string;
    value: number;
    fill: string;
}

interface Props {
    stats: StatData;
    chartData: ChartData[];
    topHotels: TopHotel[];
    statusDistribution: StatusDist[];
}

export default function Dashboard({
    stats,
    chartData,
    topHotels,
    statusDistribution,
}: Props) {
    const StatCard = ({
        title,
        value,
        change,
        isPositive,
        icon: Icon,
        colorClass,
        borderClass,
    }: any) => (
        <div
            className={`bg-white p-5 rounded-3xl shadow-sm border ${borderClass} flex flex-col justify-between`}
        >
            <div className="flex justify-between items-start">
                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50`}
                >
                    <Icon className={`w-5 h-5 ${colorClass}`} />
                </div>
                <span
                    className={`text-sm font-semibold ${isPositive ? "text-green-500 bg-green-50" : "text-red-500 bg-red-50"} px-2 py-1 rounded-lg`}
                >
                    {isPositive ? "+" : ""}
                    {change}%
                </span>
            </div>
            <div className="mt-4">
                <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {value}
                </h3>
                <p className="text-sm font-medium text-gray-400 mt-1">
                    {title}
                </p>
            </div>
        </div>
    );

    return (
        <AdminLayout>
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        Bonjour ! <span className="text-2xl">👋</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        Cette semaine
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <Filter className="w-4 h-4 text-gray-400" />
                        Filtrer
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <ArrowUpDown className="w-4 h-4 text-gray-400" />
                        Trier
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <Settings className="w-4 h-4 text-gray-400" />
                        Paramètres
                    </button>
                </div>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (Chart + Guests) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Campaign Overview Chart */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-900">
                                Aperçu des Réservations
                            </h2>
                            <div className="flex items-center gap-2">
                                <select className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none">
                                    <option>Hebdomadaire</option>
                                    <option>Mensuel</option>
                                </select>
                                <button className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
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
                                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                                        dx={-10}
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
                                        dot={{
                                            r: 4,
                                            fill: "#10b981",
                                            strokeWidth: 2,
                                            stroke: "#fff",
                                        }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        name="Confirmées"
                                        type="monotone"
                                        dataKey="Visited"
                                        stroke="#f59e0b"
                                        strokeWidth={3}
                                        dot={{
                                            r: 4,
                                            fill: "#f59e0b",
                                            strokeWidth: 2,
                                            stroke: "#fff",
                                        }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Current Guests (Top Hotels Replacement) */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-900">
                                Meilleurs Hôtels Formants
                            </h2>
                            <div className="flex items-center gap-2">
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
                                    <Filter className="w-3.5 h-3.5" /> Filtres
                                </button>
                                <button className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4 mb-6">
                            <div className="bg-green-50 px-4 py-3 rounded-xl flex-1 border border-green-100/50">
                                <p className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-green-500 rounded-full block"></span>
                                    {stats?.booked}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Total des réservations
                                </p>
                            </div>
                            <div className="bg-blue-50 px-4 py-3 rounded-xl flex-1 border border-blue-100/50">
                                <p className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-blue-500 rounded-full block"></span>
                                    {stats?.pending}
                                </p>
                                <p className="text-xs text-gray-400">
                                    En attente
                                </p>
                            </div>
                            <div className="bg-yellow-50 px-4 py-3 rounded-xl flex-1 border border-yellow-100/50">
                                <p className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-yellow-400 rounded-full block"></span>
                                    {stats?.cancelled}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Annulées
                                </p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {topHotels?.map((hotel, index) => {
                                const colors = [
                                    "bg-green-500",
                                    "bg-blue-500",
                                    "bg-yellow-400",
                                ];
                                const colorClass =
                                    colors[index % colors.length];
                                return (
                                    <div key={hotel.name}>
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-sm font-semibold text-gray-700">
                                                {hotel.name}
                                            </span>
                                            <div className="text-right">
                                                <span className="text-xs text-gray-400 mr-2">
                                                    {hotel.total} Réservations
                                                </span>
                                                <span className="text-sm font-bold text-gray-900">
                                                    {hotel.percentage}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                                            <div
                                                className={`${colorClass} h-2.5 rounded-full`}
                                                style={{
                                                    width: `${hotel.percentage}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                            {(!topHotels || topHotels.length === 0) && (
                                <div className="text-center text-sm text-gray-400 py-4">
                                    Aucune donnée disponible.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column (Stats Grid + Revenue) */}
                <div className="space-y-6">
                    {/* 4 Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard
                            title="Chambres Réservées"
                            value={stats.booked.toLocaleString()}
                            change={18.5}
                            isPositive={true}
                            icon={CalendarDays}
                            colorClass="text-green-500"
                            borderClass="border-green-100"
                        />
                        <StatCard
                            title="Réservations Annulées"
                            value={stats.cancelled.toLocaleString()}
                            change={24.8}
                            isPositive={false}
                            icon={Users}
                            colorClass="text-yellow-500"
                            borderClass="border-yellow-100"
                        />
                        <StatCard
                            title="Chiffre d'Affaires"
                            value={`${(stats.revenue * 0.4).toLocaleString()} MAD`}
                            change={14.6}
                            isPositive={false}
                            icon={Building2}
                            colorClass="text-blue-500"
                            borderClass="border-blue-100"
                        />
                        <StatCard
                            title="Revenus Attendus"
                            value={`${(stats.revenue * 0.6).toLocaleString()} MAD`}
                            change={12.8}
                            isPositive={true}
                            icon={TrendingUp}
                            colorClass="text-purple-500"
                            borderClass="border-purple-100"
                        />
                    </div>

                    {/* Revenue Stat */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[380px]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900">
                                Statistiques des Revenus
                            </h2>
                            <button className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusDistribution || []}
                                        cx="50%"
                                        cy="60%"
                                        startAngle={180}
                                        endAngle={0}
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {statusDistribution?.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.fill}
                                                />
                                            ),
                                        )}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Total Revenue Center Text */}
                            <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                <p className="text-xs font-semibold text-gray-400 mb-1">
                                    Revenu Total
                                </p>
                                <p className="text-3xl font-bold text-gray-900 tracking-tight">
                                    {stats.revenue.toLocaleString()} MAD
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-center gap-6 mt-4 mb-6">
                            {statusDistribution?.map((stat) => (
                                <div
                                    key={stat.name}
                                    className="flex items-center gap-2"
                                >
                                    <span
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: stat.fill }}
                                    ></span>
                                    <span className="text-xs font-medium text-gray-500">
                                        {stat.name}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto bg-green-50 rounded-xl p-3 flex items-center gap-3">
                            <span className="text-green-600 text-xs font-bold px-2 py-1 bg-green-100 rounded-md">
                                +16.2%
                            </span>
                            <p className="text-xs font-medium text-gray-600">
                                Vous avez obtenu{" "}
                                <span className="text-gray-900 font-bold">
                                    {stats.booked} réservations
                                </span>{" "}
                                par rapport au mois précédent
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

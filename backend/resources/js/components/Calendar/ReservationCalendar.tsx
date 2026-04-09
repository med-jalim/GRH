import { useState, useMemo, useCallback } from "react";
import {
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    isSameMonth,
    isToday,
    parseISO,
    addWeeks,
    subWeeks,
    startOfYear,
    endOfYear,
    eachMonthOfInterval,
    isSameDay,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Clock,
    CheckCircle,
    XCircle,
    CreditCard,
    ClipboardCheck,
    UserCheck,
    Wallet,
    Building2,
    Users,
} from "lucide-react";
import { Link } from "@inertiajs/react";

// ── Types & Config ─────────────────────────────────────────────────────────

export interface Reservation {
    id: number;
    code_reference: string;
    nom_contact: string;
    email: string;
    id_hotel: number;
    date_arrivee: string;
    date_depart: string;
    nb_personnes: number;
    prix_total: number;
    statut: string;
    hotel?: {
        id?: number;
        name: string;
        ville: string;
    } | null;
}

const STATUT_CONFIG: Record<string, any> = {
    en_attente: {
        label: "En attente",
        icon: Clock,
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        dot: "bg-amber-400",
    },
    confirme: {
        label: "Confirmée",
        icon: CheckCircle,
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        dot: "bg-emerald-400",
    },
    annule: {
        label: "Annulée",
        icon: XCircle,
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        dot: "bg-red-400",
    },
    en_attente_paiement: {
        label: "Attente paiement",
        icon: CreditCard,
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        border: "border-indigo-200",
        dot: "bg-indigo-400",
    },
    en_validation: {
        label: "Vérification",
        icon: ClipboardCheck,
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-200",
        dot: "bg-yellow-400",
    },
    valide: {
        label: "Validée",
        icon: UserCheck,
        bg: "bg-cyan-50",
        text: "text-cyan-700",
        border: "border-cyan-200",
        dot: "bg-cyan-400",
    },
    partiellement_paye: {
        label: "Partiel",
        icon: Wallet,
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        dot: "bg-blue-400",
    },
};

function formatPrice(amount: number) {
    return (
        new Intl.NumberFormat("fr-MA", {
            style: "decimal",
            minimumFractionDigits: 0,
        }).format(amount) + " MAD"
    );
}

export interface ReservationCalendarProps {
    reservations: Reservation[];
    dateMode: "check_in" | "check_out";
}

export function ReservationCalendar({
    reservations,
    dateMode,
}: ReservationCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<"week" | "month" | "year">("month");

    const prev = () => {
        if (view === "month") setCurrentDate((d) => subMonths(d, 1));
        else if (view === "week") setCurrentDate((d) => subWeeks(d, 1));
        else setCurrentDate((d) => subMonths(d, 12));
    };

    const next = () => {
        if (view === "month") setCurrentDate((d) => addMonths(d, 1));
        else if (view === "week") setCurrentDate((d) => addWeeks(d, 1));
        else setCurrentDate((d) => addMonths(d, 12));
    };

    const today = () => setCurrentDate(new Date());

    const getReservationsForDay = useCallback(
        (day: Date) => {
            return reservations.filter((r) => {
                const dateStr = dateMode === "check_in" ? r.date_arrivee : r.date_depart;
                const rDate = parseISO(dateStr);
                return isSameDay(day, rDate);
            });
        },
        [reservations, dateMode]
    );

    const renderHeader = () => {
        let title = "";
        if (view === "month")
            title = format(currentDate, "MMMM yyyy", { locale: fr });
        else if (view === "week") {
            const start = startOfWeek(currentDate, { weekStartsOn: 1 });
            const end = endOfWeek(currentDate, { weekStartsOn: 1 });
            title = `${format(start, "dd MMM", { locale: fr })} – ${format(end, "dd MMM yyyy", { locale: fr })}`;
        } else {
            title = format(currentDate, "yyyy", { locale: fr });
        }

        return (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-bold text-slate-900 capitalize tracking-tight min-w-[170px]">
                        {title}
                    </h3>
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        {(["week", "month", "year"] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                    view === v
                                        ? "bg-white text-slate-900 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                {v === "week" ? "Semaine" : v === "month" ? "Mois" : "Année"}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                    <button
                        onClick={prev}
                        className="p-2.5 hover:bg-slate-50 active:bg-slate-100 text-slate-600 border-r border-slate-200 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={today}
                        className="px-5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 active:bg-slate-100 border-r border-slate-200 transition-colors"
                    >
                        Aujourd'hui
                    </button>
                    <button
                        onClick={next}
                        className="p-2.5 hover:bg-slate-50 active:bg-slate-100 text-slate-600 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    };

    const renderReservationCard = (r: Reservation) => {
        const config = STATUT_CONFIG[r.statut] || STATUT_CONFIG.en_attente;
        const Icon = config.icon;

        return (
            <Link
                key={r.id}
                href={`/admin/reservations/${r.id}`}
                className={`
                    group flex flex-col p-2 rounded-lg border shadow-sm transition-all hover:shadow-md hover:scale-[1.02]
                    ${config.bg} ${config.border}
                `}
            >
                <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[9px] font-bold text-slate-500 truncate group-hover:text-slate-700">
                        {r.code_reference}
                    </span>
                    <Icon className={`w-3 h-3 ${config.text}`} />
                </div>
                <p className="text-[10px] font-bold text-slate-800 truncate mb-0.5">
                    {r.nom_contact}
                </p>
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1">
                         <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                         <span className={`text-[8px] font-bold uppercase tracking-tighter ${config.text}`}>
                             {config.label}
                         </span>
                    </div>
                </div>
            </Link>
        );
    };

    const renderDayCell = (day: Date, isCurrent: boolean, isWeekView = false) => {
        const dayReservations = getReservationsForDay(day);
        const isTodayDate = isToday(day);
        const displayLimit = 3;
        const displayReservations = dayReservations.slice(0, displayLimit);
        const remaining = dayReservations.length - displayLimit;

        return (
            <div
                key={day.toISOString()}
                className={`
                    ${isWeekView ? "min-h-[400px]" : "min-h-[140px]"}
                    p-2 flex flex-col justify-start transition-colors relative
                    ${!isCurrent ? "bg-slate-50/40" : "bg-white"}
                    hover:bg-slate-50/50
                `}
            >
                <div className="flex justify-between items-start mb-2">
                    <span
                        className={`
                        inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded-full
                        ${
                            isTodayDate
                                ? "bg-slate-900 text-white shadow-lg"
                                : isCurrent
                                  ? "text-slate-700"
                                  : "text-slate-300"
                        }
                    `}
                    >
                        {format(day, "d")}
                    </span>
                    {dayReservations.length > 0 && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                             <Users className="w-2.5 h-2.5 text-slate-400" />
                             <span className="text-[10px] font-bold text-slate-600">{dayReservations.length}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-1.5 overflow-hidden">
                    {displayReservations.map(renderReservationCard)}
                    {remaining > 0 && (
                        <div className="text-center py-1 mt-0.5 rounded-md bg-slate-100/50 border border-dashed border-slate-200">
                            <span className="text-[10px] font-bold text-slate-500">
                                +{remaining} de plus
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderMonthOrWeek = () => {
        let days: Date[] = [];
        if (view === "month") {
            const monthStart = startOfMonth(currentDate);
            days = eachDayOfInterval({
                start: startOfWeek(monthStart, { weekStartsOn: 1 }),
                end: endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 }),
            });
        } else {
            days = eachDayOfInterval({
                start: startOfWeek(currentDate, { weekStartsOn: 1 }),
                end: endOfWeek(currentDate, { weekStartsOn: 1 }),
            });
        }

        return (
            <div className="bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col gap-px select-none">
                <div className="grid grid-cols-7 gap-px bg-slate-200">
                    {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
                        <div
                            key={d}
                            className="bg-slate-50/80 px-3 py-3 text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest"
                        >
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-px bg-slate-200">
                    {days.map((day) => {
                        const isCurrent = view === "week" ? true : isSameMonth(day, currentDate);
                        return renderDayCell(day, isCurrent, view === "week");
                    })}
                </div>
            </div>
        );
    };

    const renderYear = () => {
        const months = eachMonthOfInterval({
            start: startOfYear(currentDate),
            end: endOfYear(currentDate),
        });

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {months.map((month) => {
                    const daysInMonth = eachDayOfInterval({
                        start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
                        end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
                    });

                    return (
                        <div
                            key={month.toISOString()}
                            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
                        >
                            <h4 className="text-sm font-bold text-slate-800 capitalize mb-4 px-1 flex items-center justify-between">
                                <span>{format(month, "MMMM", { locale: fr })}</span>
                                <span className="text-[10px] font-medium text-slate-400">
                                     {reservations.filter(r => {
                                         const dateStr = dateMode === "check_in" ? r.date_arrivee : r.date_depart;
                                         return isSameMonth(parseISO(dateStr), month);
                                     }).length} rés.
                                </span>
                            </h4>
                            <div className="grid grid-cols-7 gap-1">
                                {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                                    <div key={i} className="text-[9px] font-bold text-slate-300 text-center mb-1 uppercase">
                                        {d}
                                    </div>
                                ))}
                                {daysInMonth.map((day) => {
                                    const isCurrentMonth = isSameMonth(day, month);
                                    const isTodayDate = isToday(day);
                                    const dayReservations = getReservationsForDay(day);
                                    const hasReservations = dayReservations.length > 0;

                                    return (
                                        <div
                                            key={day.toISOString()}
                                            className={`
                                                aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] transition-all
                                                ${!isCurrentMonth ? "pointer-events-none text-transparent" : "cursor-default"}
                                                ${isTodayDate && isCurrentMonth ? "ring-2 ring-slate-900 ring-offset-1 font-bold" : ""}
                                                ${hasReservations && isCurrentMonth ? "bg-slate-900 text-white font-bold" : "text-slate-600 hover:bg-slate-100"}
                                            `}
                                        >
                                            {isCurrentMonth ? format(day, "d") : ""}
                                            {hasReservations && isCurrentMonth && (
                                                <div className="w-1 h-1 rounded-full bg-white mt-0.5" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="p-6 bg-slate-50/50">
            {renderHeader()}
            {view === "year" ? renderYear() : renderMonthOrWeek()}
        </div>
    );
}

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
    Users,
    Hotel,
    Calendar as CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---

interface Reservation {
    id: number;
    code_reference: string;
    nom_contact: string;
    date_arrivee: string;
    date_depart: string;
    statut: string;
    hotel?: { name: string };
}

interface ReservationCalendarProps {
    reservations: Reservation[];
    onReservationClick: (res: Reservation) => void;
    onMonthChange?: (date: Date) => void;
    isLoading?: boolean;
}

const STATUS_COLORS: Record<
    string,
    { bg: string; text: string; border: string; dot: string }
> = {
    en_attente: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        dot: "bg-amber-400",
    },
    en_verification: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        dot: "bg-blue-400",
    },
    valide: {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        border: "border-indigo-200",
        dot: "bg-indigo-400",
    },
    en_attente_paiement: {
        bg: "bg-violet-50",
        text: "text-violet-700",
        border: "border-violet-200",
        dot: "bg-violet-400",
    },
    paye_partiellement: {
        bg: "bg-cyan-50",
        text: "text-cyan-700",
        border: "border-cyan-200",
        dot: "bg-cyan-400",
    },
    confirme: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        dot: "bg-emerald-400",
    },
    annule: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        dot: "bg-red-400",
    },
};

export function ReservationCalendar({
    reservations,
    onReservationClick,
    onMonthChange,
    isLoading = false,
}: ReservationCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<"week" | "month" | "year">("month");

    const handleMonthChange = (newDate: Date) => {
        setCurrentDate(newDate);
        if (onMonthChange) onMonthChange(newDate);
    };

    const prev = () => {
        if (view === "month") handleMonthChange(subMonths(currentDate, 1));
        else if (view === "week") handleMonthChange(subWeeks(currentDate, 1));
        else handleMonthChange(subMonths(currentDate, 12));
    };

    const next = () => {
        if (view === "month") handleMonthChange(addMonths(currentDate, 1));
        else if (view === "week") handleMonthChange(addWeeks(currentDate, 1));
        else handleMonthChange(addMonths(currentDate, 12));
    };

    const today = () => handleMonthChange(new Date());

    const getReservationsForDay = useCallback(
        (day: Date) => {
            return reservations.filter((r) => {
                const start = parseISO(r.date_arrivee);
                start.setHours(0, 0, 0, 0);
                const end = parseISO(r.date_depart);
                end.setHours(23, 59, 59, 999);
                return day >= start && day <= end;
            });
        },
        [reservations],
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-2">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-slate-900 capitalize tracking-tight min-w-[180px]">
                        {title}
                    </h3>
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
                        {(["week", "month", "year"] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200",
                                    view === v
                                        ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                                        : "text-slate-500 hover:text-slate-800",
                                )}
                            >
                                {v === "week"
                                    ? "Semaine"
                                    : v === "month"
                                      ? "Mois"
                                      : "Année"}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isLoading && (
                        <span className="text-xs text-slate-400 animate-pulse font-medium">
                            Chargement...
                        </span>
                    )}
                    <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <button
                            onClick={prev}
                            className="p-2.5 hover:bg-slate-50 border-r border-slate-200 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <button
                            onClick={today}
                            className="px-5 py-2 text-[13px] font-bold text-slate-700 hover:bg-slate-50 border-r border-slate-200 transition-colors"
                        >
                            Aujourd'hui
                        </button>
                        <button
                            onClick={next}
                            className="p-2.5 hover:bg-slate-50 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderDayCell = (
        day: Date,
        isCurrent: boolean,
        isWeekView = false,
    ) => {
        const reservationsForDay = getReservationsForDay(day);
        const isTodayDate = isToday(day);

        return (
            <div
                key={day.toISOString()}
                className={cn(
                    "flex flex-col h-full min-h-[130px] p-2 transition-all border-slate-100",
                    isWeekView ? "min-h-[400px]" : "",
                    !isCurrent ? "bg-slate-50/50 opacity-60" : "bg-white",
                    "hover:bg-slate-50/80 cursor-default group border-r border-b",
                )}
            >
                <div className="flex justify-between items-start mb-2">
                    <span
                        className={cn(
                            "inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded-full transition-transform group-hover:scale-110",
                            isTodayDate
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 ring-2 ring-indigo-50"
                                : isCurrent
                                  ? "text-slate-800"
                                  : "text-slate-400",
                        )}
                    >
                        {format(day, "d")}
                    </span>
                    {reservationsForDay.length > 0 && (
                        <span className="text-[10px] font-black text-slate-300 group-hover:text-amber-500 transition-colors">
                            {reservationsForDay.length}{" "}
                            {reservationsForDay.length > 1 ? "RES" : "RES"}
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-0.5">
                    {reservationsForDay.map((r) => {
                        const isStart = isSameDay(
                            day,
                            parseISO(r.date_arrivee),
                        );
                        const isEnd = isSameDay(day, parseISO(r.date_depart));
                        const statusStyle =
                            STATUS_COLORS[r.statut] || STATUS_COLORS.en_attente;

                        return (
                            <div
                                key={`${r.id}-${day.toISOString()}`}
                                onClick={() => onReservationClick(r)}
                                className={cn(
                                    "px-2 py-1 rounded-md text-[10px] font-bold truncate cursor-pointer transition-all hover:scale-[1.02] active:scale-95 border",
                                    statusStyle.bg,
                                    statusStyle.text,
                                    statusStyle.border,
                                    isStart ? "rounded-l-lg border-l-4" : "",
                                    isEnd ? "rounded-r-lg border-r-4" : "",
                                    !isStart && !isEnd
                                        ? "rounded-none opacity-90 border-x-0"
                                        : "",
                                )}
                                title={`${r.code_reference} - ${r.nom_contact}`}
                            >
                                <div className="flex items-center gap-1.5">
                                    <div
                                        className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            statusStyle.dot,
                                        )}
                                    />
                                    <span className="truncate">
                                        {r.code_reference.split("-")[1]}{" "}
                                        {r.nom_contact}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
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
            <div className="bg-white border-l border-t border-slate-200 rounded-3xl overflow-hidden shadow-xl ring-1 ring-slate-200">
                {/* Day Headers */}
                <div className="grid grid-cols-7 bg-slate-50/80 border-b border-slate-200">
                    {[
                        "Lundi",
                        "Mardi",
                        "Mercredi",
                        "Jeudi",
                        "Vendredi",
                        "Samedi",
                        "Dimanche",
                    ].map((d) => (
                        <div
                            key={d}
                            className="px-4 py-4 text-[11px] font-extrabold text-slate-500 text-center uppercase tracking-widest"
                        >
                            <span className="hidden md:inline">{d}</span>
                            <span className="md:hidden">
                                {d.substring(0, 3)}
                            </span>
                        </div>
                    ))}
                </div>
                {/* Day Cells Grid */}
                <div className="grid grid-cols-7">
                    {days.map((day) => {
                        const isCurrent =
                            view === "week"
                                ? true
                                : isSameMonth(day, currentDate);
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
                        start: startOfWeek(startOfMonth(month), {
                            weekStartsOn: 1,
                        }),
                        end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
                    });

                    return (
                        <div
                            key={month.toISOString()}
                            className="bg-white border border-slate-200 rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <h4 className="text-sm font-black text-slate-800 capitalize mb-4 px-2 tracking-tight">
                                {format(month, "MMMM", { locale: fr })}
                            </h4>
                            <div className="grid grid-cols-7 gap-1">
                                {["L", "M", "M", "J", "V", "S", "D"].map(
                                    (d, i) => (
                                        <div
                                            key={i}
                                            className="text-[10px] font-bold text-slate-300 text-center mb-1"
                                        >
                                            {d}
                                        </div>
                                    ),
                                )}
                                {daysInMonth.map((day) => {
                                    const isCurrentMonth = isSameMonth(
                                        day,
                                        month,
                                    );
                                    const hasReservations =
                                        getReservationsForDay(day).length > 0;
                                    const isTodayDate = isToday(day);

                                    return (
                                        <div
                                            key={day.toISOString()}
                                            className={cn(
                                                "aspect-square rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                                                !isCurrentMonth
                                                    ? "text-transparent"
                                                    : "text-slate-600",
                                                isTodayDate && isCurrentMonth
                                                    ? "bg-indigo-600 text-white shadow-md ring-2 ring-indigo-50"
                                                    : "",
                                                hasReservations &&
                                                    isCurrentMonth &&
                                                    !isTodayDate
                                                    ? "bg-amber-100 text-amber-700"
                                                    : "",
                                                isCurrentMonth &&
                                                    "hover:bg-slate-100 cursor-default",
                                            )}
                                        >
                                            {isCurrentMonth
                                                ? format(day, "d")
                                                : ""}
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {renderHeader()}
            <div className="relative">
                {view === "year" ? renderYear() : renderMonthOrWeek()}
            </div>

            {/* Legend */}
            <div className="mt-8 flex flex-wrap gap-4 items-center justify-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mr-2">
                    Légende :
                </span>
                {Object.entries(STATUS_COLORS).map(([status, style]) => (
                    <div key={status} className="flex items-center gap-2">
                        <div
                            className={cn(
                                "w-3 h-3 rounded-full border shadow-sm",
                                style.bg,
                                style.border,
                                style.dot,
                            )}
                        />
                        <span className="text-xs font-semibold text-slate-600 capitalize">
                            {status.replace(/_/g, " ")}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

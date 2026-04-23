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
    addWeeks,
    subWeeks,
    startOfYear,
    endOfYear,
    eachMonthOfInterval,
    isSameDay,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reservation } from "@/types/reservations";
import { RESERVATION_STATUS_COLORS } from "@/constants/reservation-status";

// --- Types ---

interface ReservationCalendarProps {
    reservations: Reservation[];
    onReservationClick: (res: Reservation) => void;
    onMonthChange?: (date: Date) => void;
    isLoading?: boolean;
}

const STATUS_COLORS = RESERVATION_STATUS_COLORS;

const CHECKIN_STYLE = {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-300",
    dot: "bg-emerald-500",
};
const CHECKOUT_STYLE = {
    bg: "bg-rose-100",
    text: "text-rose-800",
    border: "border-rose-300",
    dot: "bg-rose-500",
};

const MAX_EVENTS_IN_MONTH_CELL = 4;

function parseLocalDate(dateInput: string): Date {
    const datePart = (dateInput || "").split("T")[0];
    const [year, month, day] = datePart.split("-").map(Number);
    if (!year || !month || !day) return new Date(dateInput);
    return new Date(year, month - 1, day);
}

function dayKey(date: Date): string {
    return format(date, "yyyy-MM-dd");
}

export default function ReservationCalendar({
    reservations,
    onReservationClick,
    onMonthChange,
    isLoading = false,
}: ReservationCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<"week" | "month" | "year">("month");
    const [viewMode, setViewMode] = useState<"checkin" | "checkout">(
        "checkin",
    );
    const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);

    const VIEW_MODE_OPTIONS: Array<{
        value: "checkin" | "checkout";
        label: string;
        description: string;
    }> = [
        // Removed Stay mode
        {
            value: "checkin",
            label: "Check-in",
            description: "Arrivees du jour",
        },
        {
            value: "checkout",
            label: "Check-out",
            description: "Departs du jour",
        },
    ];

    const currentMode =
        VIEW_MODE_OPTIONS.find((option) => option.value === viewMode) ??
        VIEW_MODE_OPTIONS[0];

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

    const reservationsByDay = useMemo(() => {
        const grouped = new Map<string, Reservation[]>();
        const push = (key: string, reservation: Reservation) => {
            const existing = grouped.get(key);
            if (existing) {
                if (!existing.find(r => r.id === reservation.id)) {
                    existing.push(reservation);
                }
            } else {
                grouped.set(key, [reservation]);
            }
        };

        reservations.forEach((reservation) => {
            const groups = reservation.groups && reservation.groups.length > 0 
                ? reservation.groups 
                : [{ date_arrivee: reservation.date_arrivee, date_depart: reservation.date_depart } as any];

            groups.forEach(group => {
                const checkIn = parseLocalDate(group.date_arrivee);
                const checkOut = parseLocalDate(group.date_depart);

                if (viewMode === "checkin") {
                    push(dayKey(checkIn), reservation);
                } else if (viewMode === "checkout") {
                    push(dayKey(checkOut), reservation);
                }
            });
        });

        return grouped;
    }, [reservations, viewMode]);

    const getReservationsForDay = useCallback(
        (day: Date) => reservationsByDay.get(dayKey(day)) ?? [],
        [reservationsByDay],
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
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <h3 className="text-xl font-bold text-slate-900 capitalize tracking-tight min-w-[150px]">
                        {title}
                    </h3>
                    <div
                        className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner"
                        role="tablist"
                        aria-label="Periode d affichage"
                    >
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
                                role="tab"
                                aria-selected={view === v}
                            >
                                {v === "week"
                                    ? "Semaine"
                                    : v === "month"
                                      ? "Mois"
                                      : "Année"}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsModeMenuOpen((open) => !open)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            aria-label="Changer le mode d affichage"
                            aria-expanded={isModeMenuOpen}
                            aria-haspopup="menu"
                        >
                            <span className="text-slate-400">Mode:</span>
                            <span>{currentMode.label}</span>
                            <ChevronDown
                                className={cn(
                                    "w-3.5 h-3.5 text-slate-400 transition-transform",
                                    isModeMenuOpen && "rotate-180",
                                )}
                            />
                        </button>
                        {isModeMenuOpen && (
                            <div
                                className="absolute z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl p-1"
                                role="menu"
                            >
                                {VIEW_MODE_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            setViewMode(option.value);
                                            setIsModeMenuOpen(false);
                                        }}
                                        className={cn(
                                            "w-full text-left px-3 py-2 rounded-lg transition-colors",
                                            option.value === viewMode
                                                ? "bg-amber-50 text-amber-700"
                                                : "text-slate-700 hover:bg-slate-50",
                                        )}
                                        role="menuitem"
                                    >
                                        <div className="text-xs font-semibold">
                                            {option.label}
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                            {option.description}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
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
                            aria-label="Periode precedente"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <button
                            onClick={today}
                            className="px-5 py-2 text-[13px] font-bold text-slate-700 hover:bg-slate-50 border-r border-slate-200 transition-colors"
                            aria-label="Retour a aujourd hui"
                        >
                            Aujourd'hui
                        </button>
                        <button
                            onClick={next}
                            className="p-2.5 hover:bg-slate-50 transition-colors"
                            aria-label="Periode suivante"
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
                                ? "bg-amber-600 text-white shadow-lg shadow-amber-100 ring-2 ring-amber-50"
                                : isCurrent
                                  ? "text-slate-800"
                                  : "text-slate-400",
                        )}
                    >
                        {format(day, "d")}
                    </span>
                    {reservationsForDay.length > 0 && (
                        <span className="text-[10px] font-black text-slate-300 group-hover:text-amber-500 transition-colors">
                            {reservationsForDay.length} RES
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-0.5">
                    {(isWeekView
                        ? reservationsForDay
                        : reservationsForDay.slice(0, MAX_EVENTS_IN_MONTH_CELL)
                    ).map((r) => {
                        const matchesGroupStart = r.groups?.some(g => isSameDay(day, parseLocalDate(g.date_arrivee)));
                        const matchesGroupEnd = r.groups?.some(g => isSameDay(day, parseLocalDate(g.date_depart)));
                        
                        const isStart = matchesGroupStart ?? isSameDay(day, parseLocalDate(r.date_arrivee));
                        const isEnd = matchesGroupEnd ?? isSameDay(day, parseLocalDate(r.date_depart));
                        const statusStyle =
                            STATUS_COLORS[r.statut] || STATUS_COLORS.en_attente;
                        const activeStyle = statusStyle;

                        return (
                            <div
                                key={`${r.id}-${day.toISOString()}`}
                                onClick={() => onReservationClick(r)}
                                className={cn(
                                    "px-2 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer transition-all hover:-translate-y-[1px] active:translate-y-0 border flex items-start gap-2",
                                    activeStyle.bg,
                                    activeStyle.text,
                                    activeStyle.border,
                                    "border-l-4",
                                )}
                                title={`${r.code_reference} - ${r.nom_contact}`}
                            >
                                <div
                                    className={cn(
                                        "mt-1 w-1.5 h-1.5 rounded-full shrink-0",
                                        activeStyle.dot,
                                    )}
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="truncate text-[10px] font-bold tracking-wide">
                                            {r.code_reference}
                                        </span>
                                        {/* Show Arrivee/Depart tag for checkins/checkouts if appropriate */}
                                        {(isStart || isEnd) && (
                                            <span className="text-[9px] font-bold uppercase text-slate-500">
                                                {isStart ? "Arrivee" : "Depart"}
                                            </span>
                                        )}
                                    </div>
                                    <div className="truncate text-[10px] text-slate-600 font-medium">
                                        {r.nom_contact}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {!isWeekView &&
                        reservationsForDay.length >
                            MAX_EVENTS_IN_MONTH_CELL && (
                            <div className="text-left text-[10px] font-semibold text-amber-600 px-1 py-0.5">
                                +
                                {reservationsForDay.length -
                                    MAX_EVENTS_IN_MONTH_CELL}{" "}
                                more
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
                                                    ? "bg-amber-600 text-white shadow-md ring-2 ring-amber-50"
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
                <div className="flex items-center gap-2 text-xs text-slate-500 mr-3">
                    <span className="font-semibold">Mode:</span>
                    <span>Check-in / Check-out</span>
                </div>
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

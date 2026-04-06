import { useState, useMemo, useCallback, useRef } from "react";
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
    min,
    max,
    isSameDay,
    isWithinInterval,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
    ChevronLeft,
    ChevronRight,
    Calendar,
    MousePointer2,
} from "lucide-react";

function formatPrice(n: number) {
    return new Intl.NumberFormat("fr-MA").format(n);
}

export interface PricingCalendarProps {
    tarifs: any[];
    selectedTypeId: string;
    onTarifClick: (t: any) => void;
    onRangeSelect: (start: Date, end: Date) => void;
}

export function PricingCalendar({
    tarifs,
    selectedTypeId,
    onTarifClick,
    onRangeSelect,
}: PricingCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<"week" | "month" | "year">("month");

    // --- Drag Selection State ---
    const [dragStart, setDragStart] = useState<Date | null>(null);
    const [dragEnd, setDragEnd] = useState<Date | null>(null);
    const isDragging = useRef(false);
    const hasMoved = useRef(false); // Did the mouse actually move to a different day?

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

    const filteredTarifs = useMemo(() => {
        if (!tarifs) return [];
        if (selectedTypeId === "all") return tarifs;
        return tarifs.filter(
            (t: any) => t.id_type.toString() === selectedTypeId,
        );
    }, [tarifs, selectedTypeId]);

    const getTarifsForDay = useCallback(
        (day: Date) => {
            const raw = filteredTarifs.filter((t: any) => {
                const start = parseISO(t.date_debut);
                start.setHours(0, 0, 0, 0);
                const end = parseISO(t.date_fin);
                end.setHours(23, 59, 59, 999);
                return day >= start && day <= end;
            });

            // Déduplication par type de chambre: on priorise toujours l'explicite sur le virtuel
            const mapped = new Map<number, any>();
            for (const t of raw) {
                const existing = mapped.get(t.id_type);
                if (!existing || (!t.is_virtual && existing.is_virtual)) {
                    mapped.set(t.id_type, t);
                }
            }
            return Array.from(mapped.values());
        },
        [filteredTarifs],
    );

    // --- Drag Range computation ---
    const dragRange = useMemo(() => {
        if (!dragStart || !dragEnd) return null;
        return {
            start: min([dragStart, dragEnd]),
            end: max([dragStart, dragEnd]),
        };
    }, [dragStart, dragEnd]);

    const isDayInDragRange = (day: Date) => {
        if (!dragRange) return false;
        return isWithinInterval(day, {
            start: dragRange.start,
            end: dragRange.end,
        });
    };

    // --- Drag Event Handlers ---
    const handleMouseDown = (day: Date) => {
        isDragging.current = true;
        hasMoved.current = false;
        setDragStart(day);
        setDragEnd(day);
    };

    const handleMouseEnter = (day: Date) => {
        if (!isDragging.current) return;
        if (!dragStart || !isSameDay(day, dragStart)) {
            hasMoved.current = true;
        }
        setDragEnd(day);
    };

    const handleMouseUp = (day: Date, tarifsDuJour: any[]) => {
        if (!isDragging.current) return;
        isDragging.current = false;

        if (!hasMoved.current) {
            // Simple click: no drag movement occurred
            setDragStart(null);
            setDragEnd(null);
            if (tarifsDuJour.length > 0) {
                onTarifClick(tarifsDuJour[0]); // Open edit modal
            } else {
                onRangeSelect(day, day); // Open create modal for that single day
            }
        } else {
            // Drag ended: fire range select
            const start = min([dragStart!, day]);
            const end = max([dragStart!, day]);
            setDragStart(null);
            setDragEnd(null);
            onRangeSelect(start, end);
        }
    };

    const handleMouseLeaveGrid = () => {
        // If mouse leaves the grid without mouseup, cancel drag
        if (isDragging.current) {
            isDragging.current = false;
            hasMoved.current = false;
            setDragStart(null);
            setDragEnd(null);
        }
    };

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
                    <h3 className="text-lg font-bold text-slate-900 capitalize tracking-tight min-w-[170px]">
                        {title}
                    </h3>
                    {/* View Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        {(["week", "month", "year"] as const).map((v) => {
                            const labels = {
                                week: "Semaine",
                                month: "Mois",
                                year: "Année",
                            };
                            return (
                                <button
                                    key={v}
                                    onClick={() => setView(v)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                                        view === v
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "text-slate-500 hover:text-slate-700"
                                    }`}
                                >
                                    {labels[v]}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Prev / Today / Next */}
                <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                    <button
                        onClick={prev}
                        className="p-2 hover:bg-slate-50 active:bg-slate-100 text-slate-600 border-r border-slate-200 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={today}
                        className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 border-r border-slate-200 transition-colors"
                    >
                        Aujourd'hui
                    </button>
                    <button
                        onClick={next}
                        className="p-2 hover:bg-slate-50 active:bg-slate-100 text-slate-600 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    };

    const renderDayCell = (
        day: Date,
        isCurrent: boolean,
        isWeekView = false,
    ) => {
        const tarifsDuJour = getTarifsForDay(day);
        const isTodayDate = isToday(day);
        const inDrag = isDayInDragRange(day);
        const isDragStartDay = dragStart && isSameDay(day, dragStart);
        const isDragEndDay =
            dragEnd && isSameDay(day, dragEnd) && hasMoved.current;

        let cellBg = !isCurrent
            ? "bg-slate-50/40"
            : "bg-white hover:bg-slate-50/70";
        if (inDrag) cellBg = "bg-indigo-50";
        if (isDragStartDay || isDragEndDay) cellBg = "bg-indigo-100";

        return (
            <div
                key={day.toISOString()}
                onMouseDown={() => handleMouseDown(day)}
                onMouseEnter={() => handleMouseEnter(day)}
                onMouseUp={() => handleMouseUp(day, tarifsDuJour)}
                className={`
                    ${isWeekView ? "min-h-[280px]" : "min-h-[110px]"}
                    p-2 flex flex-col justify-start cursor-pointer select-none transition-colors group relative
                    ${cellBg}
                    ${inDrag ? "ring-1 ring-inset ring-indigo-200" : ""}
                `}
            >
                <div className="flex justify-between items-start mb-1.5">
                    <span
                        className={`
                        inline-flex items-center justify-center w-7 h-7 text-xs font-semibold rounded-full
                        ${
                            isTodayDate
                                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                                : isCurrent
                                  ? "text-slate-800"
                                  : "text-slate-400"
                        }
                        ${inDrag && !isTodayDate ? "text-indigo-700" : ""}
                    `}
                    >
                        {format(day, "d")}
                    </span>
                </div>

                <div className="flex flex-col gap-1.5 mt-auto">
                    {tarifsDuJour.map((t) => (
                        <div
                            key={t.id}
                            className={`
                                px-2 py-1.5 rounded text-[11px] font-bold truncate text-center shadow-sm select-none border
                            `}
                            style={{ 
                                backgroundColor: t.type?.color ? `${t.type.color}15` : '#f8fafc',
                                color: t.type?.color || '#334155',
                                borderColor: t.type?.color ? `${t.type.color}40` : '#e2e8f0'
                            }}
                            title={selectedTypeId === 'all' ? t.type?.nom : undefined}
                        >
                            {formatPrice(t.prix)}{" "}
                            <span className="text-[9px] font-semibold opacity-60">
                                MAD
                            </span>
                            {selectedTypeId === "all" && (
                                <div className="text-[9px] font-medium opacity-70 mt-0.5 truncate">
                                    {t.type?.nom}
                                </div>
                            )}
                        </div>
                    ))}
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
            <div
                className="bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col gap-px select-none"
                onMouseLeave={handleMouseLeaveGrid}
            >
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-px bg-slate-200">
                    {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(
                        (d) => (
                            <div
                                key={d}
                                className="bg-slate-50/80 px-3 py-3 text-xs font-semibold text-slate-500 text-center uppercase tracking-wider"
                            >
                                {d}
                            </div>
                        ),
                    )}
                </div>
                {/* Day Cells */}
                <div className="grid grid-cols-7 gap-px bg-slate-200">
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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
                            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
                        >
                            <h4 className="text-sm font-bold text-slate-800 capitalize mb-3 px-1">
                                {format(month, "MMMM", { locale: fr })}
                            </h4>
                            <div className="grid grid-cols-7 gap-0.5">
                                {["L", "M", "M", "J", "V", "S", "D"].map(
                                    (d, i) => (
                                        <div
                                            key={i}
                                            className="text-[9px] font-bold text-slate-400 text-center mb-1"
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
                                    const isTodayDate = isToday(day);
                                    const tarifsDuJour = getTarifsForDay(day);
                                    const hasTarifs = tarifsDuJour.length > 0;
                                    const inDrag = isDayInDragRange(day);

                                    const firstTarifColor = hasTarifs ? tarifsDuJour[0].type?.color : null;

                                    return (
                                        <div
                                            key={day.toISOString()}
                                            onMouseDown={() =>
                                                isCurrentMonth &&
                                                handleMouseDown(day)
                                            }
                                            onMouseEnter={() =>
                                                isCurrentMonth &&
                                                handleMouseEnter(day)
                                            }
                                            onMouseUp={() =>
                                                isCurrentMonth &&
                                                handleMouseUp(day, tarifsDuJour)
                                            }
                                            className={`
                                                aspect-square rounded-full flex items-center justify-center text-[10px] transition-colors select-none
                                                ${!isCurrentMonth ? "pointer-events-none text-transparent" : "cursor-pointer"}
                                                ${isTodayDate && isCurrentMonth ? "ring-1 ring-indigo-500 font-bold" : ""}
                                                ${inDrag && isCurrentMonth ? "bg-indigo-500 text-white font-bold" : ""}
                                                ${!hasTarifs && !inDrag && isCurrentMonth ? "text-slate-600 hover:bg-slate-100" : ""}
                                            `}
                                            style={hasTarifs && isCurrentMonth && !inDrag ? {
                                                backgroundColor: firstTarifColor ? `${firstTarifColor}20` : '#fef3c7',
                                                color: firstTarifColor || '#92400e',
                                                fontWeight: 'bold'
                                            } : {}}
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

    // Drag hint indicator (shown while dragging)
    const dragHintBanner = dragStart && hasMoved.current && dragEnd && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-5 py-3.5 bg-slate-950/60 backdrop-blur-2xl text-white rounded-2xl flex items-center gap-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] select-none whitespace-nowrap border border-white/10 animate-in fade-in slide-in-from-bottom-6 duration-300 ease-out">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
                    <div className="relative w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <Calendar className="w-5 h-5" />
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-bold mb-0.5">
                        Sélection de période
                    </span>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <span className="text-white">
                            {format(min([dragStart, dragEnd]), "dd MMM", {
                                locale: fr,
                            })}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-white">
                            {format(max([dragStart, dragEnd]), "dd MMM yyyy", {
                                locale: fr,
                            })}
                        </span>
                    </div>
                </div>
            </div>

            <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                <MousePointer2 className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span className="text-[13px] font-medium text-slate-300">
                    Relâchez pour configurer le tarif
                </span>
            </div>
        </div>
    );

    return (
        <div className="p-6 bg-slate-50/50">
            {renderHeader()}
            {view === "year" ? renderYear() : renderMonthOrWeek()}
            {dragHintBanner}
        </div>
    );
}

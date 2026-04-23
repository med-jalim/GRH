import { AdminLayout } from "@/Layouts/AdminLayout";
import { router } from "@inertiajs/react";
import {
    Search,
    Filter,
    ChevronDown,
} from "lucide-react";
import { useState, useMemo } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Select } from "@base-ui/react/select";
import { cn } from "@/lib/utils";
import { Props } from "@/types/reservations";
import ReservationsList from "@/components/Reservations/ReservationsList";
import ReservationsCalendar from "@/components/Calendar/ReservationCalendar";
import { RESERVATION_STATUS_CONFIG } from "@/constants/reservation-status";

// ── Component ──────────────────────────────────────────────────────────────

export default function ReservationsIndex({
    reservations,
    filters,
    stats,
}: Props) {
    const [activeView, setActiveView] = useState<"list" | "calendar">("list");
    const [search, setSearch] = useState("");
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{
        id: number;
        ref: string;
    } | null>(null);

    const filteredData = useMemo(() => {
        const q = search.toLowerCase();
        return reservations.data.filter(
            (r) =>
                r.code_reference.toLowerCase().includes(q) ||
                r.nom_contact.toLowerCase().includes(q) ||
                (r.nom_agence ?? "").toLowerCase().includes(q) ||
                (r.hotel?.name ?? "").toLowerCase().includes(q),
        );
    }, [reservations.data, search]);

    const handleFilterChange = (statut: string | null) => {
        router.get(
            "/admin/reservations",
            { statut: statut === "all" || !statut ? "" : statut },
            { preserveState: true, replace: true },
        );
    };

    const handleStatusUpdate = (id: number, statut: string) => {
        setUpdatingId(id);
        router.patch(
            `/admin/reservations/${id}/statut`,
            { statut },
            {
                preserveState: true,
                onFinish: () => setUpdatingId(null),
            },
        );
    };

    const initiateDelete = (id: number, ref: string) => {
        setConfirmDelete({ id, ref });
    };

    const handleConfirmDelete = () => {
        if (!confirmDelete) return;
        setDeletingId(confirmDelete.id);
        router.delete(`/admin/reservations/${confirmDelete.id}`, {
            onFinish: () => {
                setConfirmDelete(null);
                setDeletingId(null);
            },
        });
    };

    return (
        <AdminLayout>
            <div className="max-w-[1400px] mx-auto px-6 py-10">
                {/* ── 1. Integrated Metric Header (Non-card, High-end) ── */}
                <div className="flex flex-col  md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-200/60">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                            Gestion des Réservations
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                            <MetricInlineItem
                                label="Total"
                                value={stats.total}
                                color="text-slate-900"
                            />
                            <MetricInlineItem
                                label="Fermées"
                                value={stats.confirme}
                                color="text-emerald-600"
                            />
                            <MetricInlineItem
                                label="Traitement"
                                value={stats.en_attente + stats.en_verification}
                                color="text-amber-600"
                            />
                            <MetricInlineItem
                                label="Financier"
                                value={
                                    stats.en_attente_paiement +
                                    stats.paye_partiellement
                                }
                                color="text-indigo-600"
                            />
                        </div>
                    </div>

                    {/* tap navigation */}
                    <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-2xl  w-fit border border-slate-200/50">
                        <button
                            onClick={() => setActiveView("list")}
                            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
                                activeView === "list"
                                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                            Liste
                        </button>
                        <button
                            onClick={() => setActiveView("calendar")}
                            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
                                activeView === "calendar"
                                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            }
                                           `}
                        >
                            Agenda
                        </button>
                    </div>

                    {/* Toolbar in header row for vertical space optimization */}
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                            <input
                                type="text"
                                placeholder="Ref, Client, Agence..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-48 lg:w-64 pl-9 pr-4 py-2 bg-slate-100/50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-slate-300 transition-all rounded-xl text-[13px] font-medium"
                            />
                        </div>

                        <Select.Root
                            value={filters.statut || "all"}
                            onValueChange={handleFilterChange}
                        >
                            <Select.Trigger className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-700 hover:border-slate-300 transition-colors focus:outline-none">
                                <Filter className="w-3.5 h-3.5 text-slate-400" />
                                <Select.Value>
                                    {
                                        RESERVATION_STATUS_CONFIG.find(
                                            (o) =>
                                                o.value ===
                                                (filters.statut || "all"),
                                        )?.label
                                    }
                                </Select.Value>
                                <ChevronDown className="w-3.5 h-3.5 opacity-30" />
                            </Select.Trigger>
                            <Select.Portal>
                                <Select.Positioner className="z-[100] pt-1">
                                    <Select.Popup className="bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 min-w-[200px] animate-in fade-in zoom-in-95 duration-150">
                                        {RESERVATION_STATUS_CONFIG.map((opt) => (
                                            <Select.Item
                                                key={opt.value}
                                                value={opt.value}
                                                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer outline-none transition-colors hover:bg-slate-50 data-[selected]:bg-indigo-50 data-[selected]:text-indigo-700"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <opt.Icon
                                                        className={cn(
                                                            "w-3.5 h-3.5",
                                                            opt.color,
                                                        )}
                                                    />
                                                    <Select.ItemText>
                                                        {opt.label}
                                                    </Select.ItemText>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-bold">
                                                    {getStatCount(
                                                        opt.value,
                                                        stats,
                                                    )}
                                                </span>
                                            </Select.Item>
                                        ))}
                                    </Select.Popup>
                                </Select.Positioner>
                            </Select.Portal>
                        </Select.Root>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeView === "list" ? (
                        <ReservationsList
                            filteredData={filteredData}
                            reservations={reservations}
                            onStatusUpdate={handleStatusUpdate}
                            onDelete={initiateDelete}
                            updatingId={updatingId}
                            deletingId={deletingId}
                        />
                    ) : (
                        <ReservationsCalendar
                            reservations={filteredData}
                            onReservationClick={(r) =>
                                router.visit(`/admin/reservations/${r.id}`)
                            }
                        />
                    )}
                </div>

                <ConfirmDialog
                    isOpen={!!confirmDelete}
                    onClose={() => setConfirmDelete(null)}
                    onConfirm={handleConfirmDelete}
                    isLoading={deletingId !== null}
                    title="Supprimer la réservation"
                    description={`Êtes-vous sûr de vouloir supprimer la réservation ${confirmDelete?.ref} ? Cette action est irréversible.`}
                    confirmLabel="Supprimer définitivement"
                    variant="danger"
                />
            </div>
        </AdminLayout>
    );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function MetricInlineItem({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) {
    return (
        <div className="flex items-center gap-1.5">
            <span className={cn("text-[13px] font-bold", color)}>{value}</span>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-tighter">
                {label}
            </span>
            <div className="h-3 w-px bg-slate-200 mx-1 last:hidden" />
        </div>
    );
}

function getStatCount(value: string, stats: any) {
    if (value === "all") return stats.total;
    return stats[value] || 0;
}

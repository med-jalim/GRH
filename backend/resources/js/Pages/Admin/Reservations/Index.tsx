import { AdminLayout } from "@/Layouts/AdminLayout";
import { Link, router } from "@inertiajs/react";
import {
    CalendarCheck,
    Search,
    Eye,
    Trash2,
    Building2,
    Users,
    ArrowRight,
    CreditCard,
    CheckCircle2,
    Clock,
    XCircle,
    Info,
    Filter,
    Calendar,
    ChevronDown,
    Loader2,
    Briefcase,
    LayoutDashboard,
    Wallet,
    Circle,
    Hotel,
} from "lucide-react";
import { useState, useMemo } from "react";
import { StatusSelect } from "@/components/ui/status-select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Select } from "@base-ui/react/select";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

interface Hotel {
    id: number;
    name: string;
    ville: string;
}

interface Reservation {
    id: number;
    code_reference: string;
    nom_agence: string | null;
    nom_contact: string;
    email: string;
    telephone: string;
    id_hotel: number;
    date_arrivee: string;
    date_depart: string;
    nb_personnes: number;
    prix_total: number;
    montant_paye: number;
    montant_restant: number;
    pourcentage_paiement: number;
    statut:
        | "en_attente"
        | "en_verification"
        | "valide"
        | "en_attente_paiement"
        | "paye_partiellement"
        | "confirme"
        | "annule";
    created_at: string;
    hotel: Hotel | null;
    groups_count: number;
    total_items: number | string | null;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: any[];
    from: number | null;
    to: number | null;
}

interface Props {
    reservations: Paginated<Reservation>;
    filters: { id_hotel?: string; statut?: string };
    stats: any;
}

// ── Status Options ───────────────────────────────────────────────────────

const STATUS_CONFIG = [
    {
        value: "all",
        label: "Tous les statuts",
        Icon: LayoutDashboard,
        color: "text-slate-500",
        bg: "bg-slate-50",
        border: "border-slate-200",
    },
    {
        value: "en_attente",
        label: "En attente",
        Icon: Clock,
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
    },
    {
        value: "en_verification",
        label: "Vérification",
        Icon: Search,
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
    },
    {
        value: "valide",
        label: "Validé",
        Icon: CheckCircle2,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        border: "border-indigo-200",
    },
    {
        value: "en_attente_paiement",
        label: "Attente Paiement",
        Icon: CreditCard,
        color: "text-violet-600",
        bg: "bg-violet-50",
        border: "border-violet-200",
    },
    {
        value: "paye_partiellement",
        label: "Partiel",
        Icon: Briefcase,
        color: "text-cyan-600",
        bg: "bg-cyan-50",
        border: "border-cyan-200",
    },
    {
        value: "confirme",
        label: "Confirmé",
        Icon: CheckCircle2,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
    },
    {
        value: "annule",
        label: "Annulé",
        Icon: XCircle,
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
    },
] as const;

// ── Component ──────────────────────────────────────────────────────────────

export default function ReservationsIndex({
    reservations,
    filters,
    stats,
}: Props) {
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
                (r.nom_agence ?? "").toLowerCase().includes(q),
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
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-200/60">
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
                                    {STATUS_CONFIG.find(
                                        (o) =>
                                            o.value ===
                                            (filters.statut || "all"),
                                    )?.label}
                                </Select.Value>
                                <ChevronDown className="w-3.5 h-3.5 opacity-30" />
                            </Select.Trigger>
                            <Select.Portal>
                                <Select.Positioner className="z-[100] pt-1">
                                    <Select.Popup className="bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 min-w-[200px] animate-in fade-in zoom-in-95 duration-150">
                                        {STATUS_CONFIG.map((opt) => (
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

                {/* ── 2. The Refined List ── */}
                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                    {filteredData.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {filteredData.map((r) => (
                                <div
                                    key={r.id}
                                    className="group flex flex-col xl:flex-row xl:items-center gap-4 xl:gap-0 px-6 py-5 hover:bg-slate-50/40 transition-colors"
                                >
                                    {/* col 1: Reference + Contact (Primary focus) */}
                                    <div className="xl:w-[25%] flex items-center gap-4">
                                        <div
                                            className={cn(
                                                "hidden sm:flex w-9 h-9 rounded-lg items-center justify-center font-bold text-xs shrink-0",
                                                getStatusBg(r.statut),
                                            )}
                                        >
                                            {r.nom_contact.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[13px] font-bold text-slate-900 tracking-tight">
                                                    {r.code_reference}
                                                </span>
                                                <StatusDot status={r.statut} />
                                            </div>
                                            <h3 className="text-[13px] font-medium text-slate-600 truncate">
                                                {r.nom_contact}
                                            </h3>
                                            {r.nom_agence && (
                                                <p className="text-[10px] font-medium text-slate-400 mt-0.5 truncate">
                                                    {r.nom_agence}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* col 2: Dates (Natural weight) */}
                                    <div className="xl:w-[35%] flex items-center px-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-3 text-[13px] text-slate-600 font-medium">
                                                <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                                <span>
                                                    {formatDate(r.date_arrivee)}
                                                </span>
                                                <ArrowRight className="w-3 h-3 text-slate-200" />
                                                <span>
                                                    {formatDate(r.date_depart)}
                                                </span>
                                                <span className="ml-2 text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded italic whitespace-nowrap">
                                                    {getNightsText(r)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-[11px] font-bold">
                                                <div className="flex items-center gap-1.5 text-indigo-500 bg-indigo-50/50 px-2 py-0.5 rounded-lg border border-indigo-100/50">
                                                    <Users className="w-3 h-3" />
                                                    {r.groups_count}{" "}
                                                    {r.groups_count > 1
                                                        ? "Périodes"
                                                        : "Période"}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-500 bg-slate-100/50 px-2 py-0.5 rounded-lg border border-slate-200/50">
                                                    <Hotel className="w-3 h-3" />
                                                    {r.total_items}{" "}
                                                    {Number(r.total_items) > 1
                                                        ? "Chambres"
                                                        : "Chambre"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="hidden 2xl:flex items-center gap-2 ml-8 border-l border-slate-100 pl-8">
                                            <Building2 className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                            <span className="text-[12px] text-slate-500 truncate max-w-[120px]">
                                                {r.hotel?.name}
                                            </span>
                                        </div>
                                    </div>

                                    {/* col 3: Payment Progress (Familiar but sleek) */}
                                    <div className="xl:w-[20%] flex flex-col justify-center px-6 xl:border-x xl:border-slate-100">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[13px] font-bold text-slate-900">
                                                {formatPrice(r.prix_total)}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {r.pourcentage_paiement}%
                                            </span>
                                        </div>
                                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-700 rounded-full",
                                                    r.pourcentage_paiement < 30
                                                        ? "bg-red-400"
                                                        : r.pourcentage_paiement <
                                                            100
                                                          ? "bg-amber-400"
                                                          : "bg-emerald-500",
                                                )}
                                                style={{
                                                    width: `${r.pourcentage_paiement}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* col 4: Interactive Status & Actions */}
                                    <div className="xl:w-[20%] flex items-center justify-between xl:justify-end gap-4 xl:pl-6">
                                        <StatusSelect
                                            value={r.statut}
                                            loading={updatingId === r.id}
                                            size="sm"
                                            onChange={(val) =>
                                                handleStatusUpdate(r.id, val)
                                            }
                                        />

                                        <div className="flex items-center gap-1">
                                            <Link
                                                href={`/admin/reservations/${r.id}`}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                title="View"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    initiateDelete(
                                                        r.id,
                                                        r.code_reference,
                                                    )
                                                }
                                                disabled={deletingId === r.id}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 text-center">
                            <div className="inline-flex w-14 h-14 bg-slate-50 rounded-2xl items-center justify-center mb-4">
                                <Search className="w-7 h-7 text-slate-200" />
                            </div>
                            <p className="text-[13px] text-slate-500 font-medium tracking-tight">
                                Aucune réservation ne correspond à vos critères.
                            </p>
                        </div>
                    )}
                </div>

                {/* ── 3. Pagination & Meta ── */}
                {reservations.total > 0 && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-[12px] text-slate-400 font-medium">
                            <span className="text-slate-900 font-bold">
                                {reservations.from}-{reservations.to}
                            </span>{" "}
                            sur {reservations.total} résultats
                        </p>
                        <div className="flex items-center gap-1">
                            {reservations.links
                                ?.filter(
                                    (l) =>
                                        l.url || l.label.includes("Ellipsis"),
                                )
                                .map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || "#"}
                                        as={link.url ? "a" : "span"}
                                        className={cn(
                                            "px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all",
                                            link.active
                                                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                                                : !link.url
                                                  ? "text-slate-300 pointer-events-none"
                                                  : "text-slate-600 hover:bg-white border border-transparent hover:border-slate-200",
                                        )}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label
                                                .replace(
                                                    "&laquo; Previous",
                                                    "Préc.",
                                                )
                                                .replace(
                                                    "Next &raquo;",
                                                    "Suiv.",
                                                ),
                                        }}
                                    />
                                ))}
                        </div>
                    </div>
                )}

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

function StatusDot({ status }: { status: string }) {
    const colors =
        {
            en_attente: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]",
            en_verification:
                "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]",
            valide: "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]",
            en_attente_paiement:
                "bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.5)]",
            paye_partiellement:
                "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]",
            confirme: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]",
            annule: "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]",
        }[status] || "bg-slate-300";

    return <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", colors)} />;
}

function getStatCount(value: string, stats: any) {
    if (value === "all") return stats.total;
    return stats[value] || 0;
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function formatPrice(amount: number) {
    return (
        new Intl.NumberFormat("fr-MA", { style: "decimal" }).format(amount) +
        " MAD"
    );
}

function getNightsText(r: Reservation) {
    const start = new Date(r.date_arrivee);
    const end = new Date(r.date_depart);
    const diff = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return `${diff} nuits`;
}

function getStatusBg(status: string) {
    const config =
        STATUS_CONFIG.find((c) => c.value === status) || STATUS_CONFIG[0];
    return `${config.bg} ${config.color}`;
}

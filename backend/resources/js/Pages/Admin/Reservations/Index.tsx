import { AdminLayout } from "@/Layouts/AdminLayout";
import { Link, router } from "@inertiajs/react";
import {
    CalendarCheck,
    Search,
    Eye,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Building2,
    Users,
} from "lucide-react";
import { useState } from "react";
import { StatusSelect } from "@/components/ui/status-select";

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
    statut: "en_attente" | "confirme" | "annule";
    created_at: string;
    hotel: Hotel | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
    from: number | null;
    to: number | null;
}

interface Filters {
    id_hotel?: string;
    statut?: string;
}

interface Stats {
    total: number;
    en_attente: number;
    confirme: number;
    annule: number;
}

interface Props {
    reservations: Paginated<Reservation>;
    filters: Filters;
    stats: Stats;
}

// ── Helpers ────────────────────────────────────────────────────────────────


function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatPrice(amount: number) {
    return (
        new Intl.NumberFormat("fr-DZ", {
            style: "decimal",
            minimumFractionDigits: 0,
        }).format(amount) + " MAD"
    );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ReservationsIndex({
    reservations,
    filters,
    stats,
}: Props) {
    const [search, setSearch] = useState("");
    const [selectedStatut, setSelectedStatut] = useState(
        filters.statut ?? "all",
    );
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Filter by status (client-side quick filter on top of server filter)
    const filtered = reservations.data.filter((r) => {
        const q = search.toLowerCase();
        return (
            r.code_reference.toLowerCase().includes(q) ||
            r.nom_contact.toLowerCase().includes(q) ||
            (r.nom_agence ?? "").toLowerCase().includes(q) ||
            (r.hotel?.name ?? "").toLowerCase().includes(q) ||
            r.email.toLowerCase().includes(q)
        );
    });

    function applyStatutFilter(statut: string) {
        setSelectedStatut(statut);
        router.get(
            "/admin/reservations",
            {
                statut: statut === "all" ? "" : statut,
                id_hotel: filters.id_hotel ?? "",
            },
            { preserveState: true, replace: true },
        );
    }

    function handleStatusChange(id: number, newStatut: string) {
        setUpdatingId(id);
        router.patch(
            `/admin/reservations/${id}/statut`,
            { statut: newStatut },
            {
                preserveState: true,
                onFinish: () => setUpdatingId(null),
            },
        );
    }

    function handleDelete(id: number, ref: string) {
        if (
            !confirm(
                `Supprimer la réservation ${ref} ? Cette action est irréversible.`,
            )
        )
            return;
        setDeletingId(id);
        router.delete(`/admin/reservations/${id}`, {
            onFinish: () => setDeletingId(null),
        });
    }

    const statuts: { value: string; label: string }[] = [
        { value: "all", label: "Tous" },
        { value: "en_attente", label: "En attente" },
        { value: "confirme", label: "Confirmées" },
        { value: "annule", label: "Annulées" },
    ];

    return (
        <AdminLayout>
            {/* ── Header ── */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Réservations
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        {reservations.total} réservation
                        {reservations.total !== 1 ? "s" : ""} au total
                    </p>
                </div>
            </div>

            {/* ── Stats strip ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    {
                        label: "Total",
                        value: stats.total,
                        color: "text-slate-700",
                        bg: "bg-slate-100",
                    },
                    {
                        label: "En attente",
                        value: stats.en_attente,
                        color: "text-amber-700",
                        bg: "bg-amber-50",
                    },
                    {
                        label: "Confirmées",
                        value: stats.confirme,
                        color: "text-emerald-700",
                        bg: "bg-emerald-50",
                    },
                    {
                        label: "Annulées",
                        value: stats.annule,
                        color: "text-red-700",
                        bg: "bg-red-50",
                    },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] p-4 flex items-center gap-3"
                    >
                        <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}
                        >
                            <span className={`text-lg font-bold ${s.color}`}>
                                {s.value}
                            </span>
                        </div>
                        <span className="text-sm font-medium text-slate-600">
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* ── Filters & Search ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] p-4 mb-6 flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par référence, contact, hôtel..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition bg-slate-50"
                    />
                </div>

                {/* Status tabs */}
                <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                    {statuts.map((s) => (
                        <button
                            key={s.value}
                            onClick={() => applyStatutFilter(s.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                selectedStatut === s.value
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Table ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <CalendarCheck className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700">
                            Aucune réservation trouvée
                        </h3>
                        <p className="text-slate-400 mt-1 text-sm max-w-xs">
                            Essayez de modifier vos filtres ou votre recherche.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/60">
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Référence
                                    </th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Contact / Agence
                                    </th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Hôtel
                                    </th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Séjour
                                    </th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Pers.
                                    </th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Total
                                    </th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Statut
                                    </th>
                                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map((r, idx) => (
                                    <tr
                                        key={r.id}
                                        className={`group hover:bg-slate-50/70 transition-colors ${
                                            idx % 2 === 0
                                                ? "bg-white"
                                                : "bg-slate-50/30"
                                        }`}
                                    >
                                        {/* Reference */}
                                        <td className="px-5 py-4">
                                            <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                                                {r.code_reference}
                                            </span>
                                        </td>

                                        {/* Contact */}
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-slate-800">
                                                {r.nom_contact}
                                            </p>
                                            {r.nom_agence && (
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {r.nom_agence}
                                                </p>
                                            )}
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {r.email}
                                            </p>
                                        </td>

                                        {/* Hotel */}
                                        <td className="px-5 py-4">
                                            {r.hotel ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-700 text-xs">
                                                            {r.hotel.name}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            {r.hotel.ville}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs">
                                                    —
                                                </span>
                                            )}
                                        </td>

                                        {/* Dates */}
                                        <td className="px-5 py-4">
                                            <p className="text-slate-700 font-medium text-xs">
                                                {formatDate(r.date_arrivee)}
                                            </p>
                                            <p className="text-slate-400 text-xs">
                                                → {formatDate(r.date_depart)}
                                            </p>
                                        </td>

                                        {/* Personnes */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1 text-slate-600">
                                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="font-medium text-xs">
                                                    {r.nb_personnes}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Prix */}
                                        <td className="px-5 py-4">
                                            <span className="font-semibold text-slate-800 text-sm">
                                                {formatPrice(r.prix_total)}
                                            </span>
                                        </td>

                                        {/* Statut */}
                                        <td className="px-5 py-4">
                                            <StatusSelect
                                                value={r.statut}
                                                loading={updatingId === r.id}
                                                onChange={(newStatut) =>
                                                    handleStatusChange(
                                                        r.id,
                                                        newStatut,
                                                    )
                                                }
                                            />
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/reservations/${r.id}`}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Détails
                                                </Link>
                                                <button
                                                    disabled={
                                                        deletingId === r.id
                                                    }
                                                    onClick={() =>
                                                        handleDelete(
                                                            r.id,
                                                            r.code_reference,
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    {deletingId === r.id
                                                        ? "..."
                                                        : "Suppr."}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Pagination ── */}
                {reservations.last_page > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                        <p className="text-xs text-slate-500">
                            Affichage de{" "}
                            <span className="font-semibold">
                                {reservations.from}
                            </span>{" "}
                            à{" "}
                            <span className="font-semibold">
                                {reservations.to}
                            </span>{" "}
                            sur{" "}
                            <span className="font-semibold">
                                {reservations.total}
                            </span>{" "}
                            réservations
                        </p>
                        <div className="flex items-center gap-1">
                            {reservations.links.map((link, i) => {
                                if (link.label === "&laquo; Previous") {
                                    return (
                                        <Link
                                            key={i}
                                            href={link.url ?? "#"}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                                                link.url
                                                    ? "text-slate-600 hover:bg-slate-200"
                                                    : "text-slate-300 pointer-events-none"
                                            }`}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Link>
                                    );
                                }
                                if (link.label === "Next &raquo;") {
                                    return (
                                        <Link
                                            key={i}
                                            href={link.url ?? "#"}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                                                link.url
                                                    ? "text-slate-600 hover:bg-slate-200"
                                                    : "text-slate-300 pointer-events-none"
                                            }`}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    );
                                }
                                return (
                                    <Link
                                        key={i}
                                        href={link.url ?? "#"}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                                            link.active
                                                ? "bg-amber-500 text-white shadow-sm"
                                                : link.url
                                                  ? "text-slate-600 hover:bg-slate-200"
                                                  : "text-slate-400 pointer-events-none"
                                        }`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

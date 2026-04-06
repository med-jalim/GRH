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
    Clock,
    CheckCircle,
    ClipboardCheck,
    UserCheck,
    Wallet,
    ShieldAlert
} from "lucide-react";
import { useState, useEffect } from "react";
import { StatusSelect } from "@/components/ui/status-select";
import { X, CheckCircle as CheckCircleIcon, XCircle, CreditCard, ExternalLink, Info, RefreshCw, Mail, AlertTriangle } from "lucide-react";

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
    statut: "en_attente" | "confirme" | "annule" | "en_attente_paiement" | "valide" | "en_validation" | "partiellement_paye";
    payment_link: string | null;
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
    en_attente_paiement: number;
    confirme: number;
    annule: number;
}

interface Props {
    reservations: Paginated<Reservation>;
    filters: Filters;
    stats: Stats;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUT_CONFIG = {
    en_attente: {
        label: "En attente",
        icon: Clock,
        badge: "bg-amber-100 text-amber-700 border-amber-200",
    },
    en_validation: {
        label: "Requiert vérification",
        icon: ShieldAlert,
        badge: "bg-orange-100 text-orange-700 border-orange-200",
    },
    en_attente_paiement: {
        label: "Attente paiement",
        icon: CreditCard,
        badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
    },
    partiellement_paye: {
        label: "Partiellement Payée",
        icon: Wallet,
        badge: "bg-blue-100 text-blue-700 border-blue-200",
    },
    confirme: {
        label: "Confirmée",
        icon: CheckCircle,
        badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
    valide: {
        label: "Validée",
        icon: UserCheck,
        badge: "bg-cyan-100 text-cyan-700 border-cyan-200",
    },
    annule: {
        label: "Annulée",
        icon: XCircle,
        badge: "bg-red-100 text-red-700 border-red-200",
    },
};


function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatPrice(amount: number) {
    return (
        new Intl.NumberFormat("fr-MA", {
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

    // Cancellation modal state
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelMessage, setCancelMessage] = useState("");
    const [currentCancelId, setCurrentCancelId] = useState<number | null>(null);

    // Status Confirmation state
    const [isStatusConfirmModalOpen, setIsStatusConfirmModalOpen] = useState(false);
    const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{id: number, statut: string} | null>(null);

    // Delete Confirmation state
    const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [pendingDeleteRef, setPendingDeleteRef] = useState("");

    // Payment link modal state
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [tempPaymentLink, setTempPaymentLink] = useState("");
    const [currentPaymentId, setCurrentPaymentId] = useState<number | null>(null);


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
        if (newStatut === "en_attente_paiement") {
            const res = filtered.find(r => r.id === id);
            setCurrentPaymentId(id);
            setTempPaymentLink(res?.payment_link || "");
            setIsPaymentModalOpen(true);
            return;
        }

        if (newStatut === "annule") {
            setCurrentCancelId(id);
            setCancelMessage("");
            setIsCancelModalOpen(true);
            return;
        }

        setPendingStatusUpdate({ id, statut: newStatut });
        setIsStatusConfirmModalOpen(true);
    }

    const confirmStatusChange = () => {
        if (!pendingStatusUpdate) return;
        const { id, statut } = pendingStatusUpdate;

        setUpdatingId(id);
        setIsStatusConfirmModalOpen(false);

        router.patch(
            `/admin/reservations/${id}/statut`,
            { statut },
            {
                preserveState: true,
                onFinish: () => {
                    setUpdatingId(null);
                    setPendingStatusUpdate(null);
                },
            },
        );
    };

    const confirmCancellation = () => {
        if (!currentCancelId) return;

        setUpdatingId(currentCancelId);
        setIsCancelModalOpen(false);

        router.patch(
            `/admin/reservations/${currentCancelId}/statut`,
            { statut: "annule", message: cancelMessage },
            {
                preserveState: true,
                onFinish: () => {
                    setUpdatingId(null);
                    setCurrentCancelId(null);
                },
            },
        );
    };

    const confirmPaymentLink = () => {
        if (!currentPaymentId || !tempPaymentLink.trim()) return;

        setUpdatingId(currentPaymentId);
        setIsPaymentModalOpen(false);

        router.patch(
            `/admin/reservations/${currentPaymentId}/statut`,
            { statut: "en_attente_paiement", payment_link: tempPaymentLink },
            {
                preserveState: true,
                onFinish: () => {
                    setUpdatingId(null);
                    setCurrentPaymentId(null);
                },
            },
        );
    };

    function handleDelete(id: number, ref: string) {
        setPendingDeleteId(id);
        setPendingDeleteRef(ref);
        setIsDeleteConfirmModalOpen(true);
    }

    const confirmDelete = () => {
        if (!pendingDeleteId) return;
        setDeletingId(pendingDeleteId);
        setIsDeleteConfirmModalOpen(false);

        router.delete(`/admin/reservations/${pendingDeleteId}`, {
            onFinish: () => {
                setDeletingId(null);
                setPendingDeleteId(null);
                setPendingDeleteRef("");
            },
        });
    };

    const STATUT_CONFIG = {
      en_attente: {
        label: "En attente",
        icon: Clock,
        badge: "bg-amber-50 text-amber-700 border border-amber-200",
        ring: "ring-amber-300",
        dot: "bg-amber-400",
      },
      confirme: {
        label: "Confirmée",
        icon: CheckCircle,
        badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        ring: "ring-emerald-300",
        dot: "bg-emerald-400",
      },
      annule: {
        label: "Annulée",
        icon: XCircle,
        badge: "bg-red-50 text-red-700 border border-red-200",
        ring: "ring-red-300",
        dot: "bg-red-400",
      },
      en_attente_paiement: {
        label: "En attente de paiement",
        icon: CreditCard,
        badge: "bg-indigo-50 text-indigo-700 border border-indigo-200",
        ring: "ring-indigo-300",
        dot: "bg-indigo-400",
      },
      en_validation: {
        label: "Vérification requise",
        icon: ClipboardCheck,
        badge: "bg-yellow-50 text-yellow-700 border border-yellow-200",
        ring: "ring-yellow-300",
        dot: "bg-yellow-400",
      },
      valide: {
        label: "Confirmée par client",
        icon: UserCheck,
        badge: "bg-cyan-50 text-cyan-700 border border-cyan-200",
        ring: "ring-cyan-300",
        dot: "bg-cyan-400",
      },
      partiellement_paye: {
        label: "Partiellement payée",
        icon: Wallet,
        badge: "bg-blue-50 text-blue-700 border border-blue-200",
        ring: "ring-blue-300",
        dot: "bg-blue-400",
      },
    } as const;


    const statuts: { value: string; label: string }[] = [
        { value: "all", label: "Tous" },
        { value: "en_attente", label: "En attente" },
        { value: "en_attente_paiement", label: "Paiement" },
        { value: "confirme", label: "Confirmées" },
        { value: "annule", label: "Annulées" },
    ];

    const getAllowedStatuses = (current: string): any[] => {
        switch (current) {
            case 'en_attente':
                return ['en_attente', 'en_validation', 'annule'];
            case 'en_validation':
                return ['en_validation', 'annule'];
            case 'valide':
                return ['valide', 'en_attente_paiement', 'annule'];
            case 'en_attente_paiement':
                // Les statuts 'partiellement_paye' et 'confirme' sont gérés automatiquement par le système
                return ['en_attente_paiement', 'annule'];
            case 'partiellement_paye':
                // Le passage à 'confirme' est géré automatiquement lors du règlement final
                return ['partiellement_paye', 'annule'];
            case 'confirme':
                return ['confirme', 'annule'];
            case 'annule':
                return ['annule'];
            default:
                return [current, 'annule'];
        }
    };

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
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
                        label: "Att. Paiement",
                        value: stats.en_attente_paiement,
                        color: "text-indigo-700",
                        bg: "bg-indigo-50",
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
                        className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] p-4 flex flex-col sm:flex-row items-center gap-3"
                    >
                        <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}
                        >
                            <span className={`text-lg font-bold ${s.color}`}>
                                {s.value}
                            </span>
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-tight">
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
                                                onChange={(v) => handleStatusChange(r.id, v)}
                                                disabled={updatingId === r.id}
                                                loading={updatingId === r.id}
                                                allowedValues={getAllowedStatuses(r.statut)}
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

            {/* ── Cancellation Reason Modal ── */}
            {isCancelModalOpen && (
                <div role="dialog" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
                        {/* Header */}
                        <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <XCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 leading-tight">
                                        Annulation
                                    </h3>
                                    <p className="text-sm text-slate-500 font-medium">
                                        Expliquez la raison au client
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCancelModalOpen(false)}
                                className="p-2.5 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8">
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-700 tracking-tight">
                                    Message à envoyer dans l'email :
                                </label>
                                <textarea
                                    value={cancelMessage}
                                    onChange={(e) => setCancelMessage(e.target.value)}
                                    placeholder="Indiquez pourquoi la réservation est annulée... ex: Indisponibilité, Erreur de tarif, etc."
                                    className="w-full h-40 rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-400/50 transition-all resize-none shadow-inner"
                                    autoFocus
                                />
                                <div className="flex gap-2.5 items-start bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
                                    <svg className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                                        Ce message sera directement visible par le client dans l'email de notification automatique. Soyez clair et courtois.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex items-center gap-4">
                            <button
                                onClick={() => setIsCancelModalOpen(false)}
                                className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                            >
                                Ignorer
                            </button>
                            <button
                                onClick={confirmCancellation}
                                disabled={!cancelMessage.trim()}
                                className="flex-[1.5] px-6 py-3 rounded-2xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Confirmer l'annulation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Payment Link Modal ── */}
            {isPaymentModalOpen && (
                <div role="dialog" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
                        {/* Header */}
                        <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <CreditCard className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 leading-tight">
                                        Lien de paiement
                                    </h3>
                                    <p className="text-sm text-slate-500 font-medium">
                                        Requis pour ce statut
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="p-2.5 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8">
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-700 tracking-tight">
                                    URL de paiement sécurisée :
                                </label>
                                <div className="relative">
                                    <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="url"
                                        value={tempPaymentLink}
                                        onChange={(e) => setTempPaymentLink(e.target.value)}
                                        placeholder="https://payzone.ma/..."
                                        className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 transition-all font-mono"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-2.5 items-start bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                                    <Info className="w-4 h-4 text-indigo-600 mt-1 flex-shrink-0" />
                                    <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
                                        Le client recevra ce lien par e-mail avec les instructions de règlement.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex items-center gap-4">
                            <button
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmPaymentLink}
                                disabled={!tempPaymentLink.trim()}
                                className="flex-[1.5] px-6 py-3 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Affecter & Envoyer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Status Change Confirmation Modal ── */}
            {isStatusConfirmModalOpen && pendingStatusUpdate && (
                <div role="dialog" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
                        <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <RefreshCw className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 leading-tight">Confirmation</h3>
                                    <p className="text-sm text-slate-500 font-medium">Changement de statut requis</p>
                                </div>
                            </div>
                            <button onClick={() => setIsStatusConfirmModalOpen(false)} className="p-2.5 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="flex flex-col items-center gap-8 py-4">
                                <div className="flex items-center gap-6 w-full justify-between">
                                    <div className="flex-1 flex flex-col items-center gap-3">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actuel</p>
                                        <div className={`px-4 py-3 rounded-2xl text-[10px] font-bold w-full text-center border shadow-sm ${STATUT_CONFIG[filtered.find(r => r.id === pendingStatusUpdate.id)?.statut as keyof typeof STATUT_CONFIG]?.badge}`}>
                                            {STATUT_CONFIG[filtered.find(r => r.id === pendingStatusUpdate.id)?.statut as keyof typeof STATUT_CONFIG]?.label}
                                        </div>
                                    </div>
                                    <div className="pt-6">
                                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
                                            <RefreshCw className="w-5 h-5 text-slate-400" />
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center gap-3">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nouveau</p>
                                        <div className={`px-4 py-3 rounded-2xl text-[10px] font-bold w-full text-center border shadow-sm ${STATUT_CONFIG[pendingStatusUpdate.statut as keyof typeof STATUT_CONFIG]?.badge}`}>
                                            {STATUT_CONFIG[pendingStatusUpdate.statut as keyof typeof STATUT_CONFIG]?.label}
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full space-y-4">
                                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-amber-200/50">
                                            <Mail className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-amber-900">Notification Automatique</p>
                                            <p className="text-xs text-amber-700/80 font-medium leading-relaxed">
                                                Le client recevra un e-mail avec les nouveaux détails.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex items-center gap-4">
                            <button onClick={() => setIsStatusConfirmModalOpen(false)} className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">Annuler</button>
                            <button onClick={confirmStatusChange} className="flex-[1.5] px-6 py-3 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                <CheckCircle className="w-4 h-4" /> Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Reservation Delete Confirmation Modal ── */}
            {isDeleteConfirmModalOpen && (
                <div role="dialog" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
                        <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <Trash2 className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 leading-tight">Supprimer</h3>
                                    <p className="text-sm text-slate-500 font-medium">Cette réservation</p>
                                </div>
                            </div>
                            <button onClick={() => setIsDeleteConfirmModalOpen(false)} className="p-2.5 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600 focus:outline-none">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <Trash2 className="w-10 h-10 text-red-500" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 mb-2">Attention !</h4>
                            <p className="text-slate-600 text-sm font-medium leading-relaxed px-4">
                                Voulez-vous supprimer définitivement la réservation <span className="font-bold text-red-600">{pendingDeleteRef}</span> ?
                                Cette action est irréversible.
                            </p>
                        </div>

                        <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex items-center gap-4">
                            <button onClick={() => setIsDeleteConfirmModalOpen(false)} className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">Annuler</button>
                            <button onClick={confirmDelete} className="flex-[1.5] px-6 py-3 rounded-2xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                <Trash2 className="w-4 h-4" /> Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

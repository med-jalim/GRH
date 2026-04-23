import { Link } from "@inertiajs/react";
import {
    Search,
    Eye,
    Trash2,
    Building2,
    Users,
    ArrowRight,
    Calendar,
    Hotel,
    Briefcase,
} from "lucide-react";
import { StatusSelect } from "@/components/ui/status-select";
import { cn } from "@/lib/utils";
import { RESERVATION_STATUS_CONFIG } from "@/constants/reservation-status";
import { Reservation, Paginated } from "@/types/reservations";

export default function ReservationsList({
    filteredData,
    reservations,
    onStatusUpdate,
    onDelete,
    updatingId,
    deletingId,
}: {
    filteredData: Reservation[];
    reservations: Paginated<Reservation>;
    onStatusUpdate: (id: number, statut: string) => void;
    onDelete: (id: number, ref: string) => void;
    updatingId: number | null;
    deletingId: number | null;
}) {
    return (
        <div className="space-y-4">
            {filteredData.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredData.map((r) => (
                        <div
                            key={r.id}
                            className="group bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
                                
                                {/* القسم الأول: العميل والمرجع */}
                                <div className="lg:w-1/4 flex items-start gap-4">
                                    <div className={cn(
                                        "w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm",
                                        getStatusBg(r.statut)
                                    )}>
                                        {r.nom_contact.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded tracking-wide">
                                                #{r.code_reference}
                                            </span>
                                            <StatusDot status={r.statut} />
                                        </div>
                                        <h3 className="text-[14px] font-bold text-slate-900 truncate">
                                            {r.nom_contact}
                                        </h3>
                                        {r.client_type === 'groupe' ? (
                                            <p className="text-[11px] font-bold truncate flex items-center gap-1 text-amber-600">
                                                <Users className="w-3 h-3" /> Groupe Direct
                                            </p>
                                        ) : (
                                            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                                                <Briefcase className="w-3 h-3" /> {r.nom_agence || "Agence"}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* القسم الثاني: تفاصيل الإقامة (المسار الزمني) */}
                                <div className="lg:flex-1 bg-slate-50/50 rounded-xl p-3 border border-slate-100/80">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="text-center sm:text-left">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Arrivée</p>
                                            <p className="text-[13px] font-semibold text-slate-700">{formatDate(r.date_arrivee)}</p>
                                        </div>
                                        
                                        <div className="flex-1 flex flex-col items-center">
                                            <span className="text-[10px] font-medium text-slate-400 mb-1">{getNightsText(r)}</span>
                                            <div className="w-full h-[1px] bg-slate-200 relative flex items-center justify-center">
                                                <ArrowRight className="w-3 h-3 text-slate-300 bg-white rounded-full p-0.5" />
                                            </div>
                                            <div className="flex gap-3 mt-1 text-[10px] font-bold text-slate-500">
                                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {r.nb_personnes}</span>
                                                <span className="flex items-center gap-1"><Hotel className="w-3 h-3" /> {r.total_items}</span>
                                            </div>
                                        </div>

                                        <div className="text-center sm:text-right">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Départ</p>
                                            <p className="text-[13px] font-semibold text-slate-700">{formatDate(r.date_depart)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* القسم الثالث: الحالة المادية والأكشن */}
                                <div className="lg:w-1/4 flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[15px] font-black text-slate-900 leading-none">
                                            {formatPrice(r.prix_total)}
                                        </span>
                                        <div className="mt-2 w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-500",
                                                    r.pourcentage_paiement >= 100 ? "bg-emerald-500" : "bg-amber-400"
                                                )}
                                                style={{ width: `${r.pourcentage_paiement}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <StatusSelect
                                            value={r.statut}
                                            loading={updatingId === r.id}
                                            size="sm"
                                            onChange={(val) => onStatusUpdate(r.id, val)}
                                        />
                                        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                                            <Link
                                                href={`/admin/reservations/${r.id}`}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                                                title="Voir"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <div className="w-[1px] h-4 bg-slate-100" />
                                            <button
                                                onClick={() => onDelete(r.id, r.code_reference)}
                                                disabled={deletingId === r.id}
                                                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty state يبقى كما هو */
                <div className="py-24 text-center bg-white border border-slate-200/80 rounded-2xl">
                    <div className="inline-flex w-14 h-14 bg-slate-50 rounded-2xl items-center justify-center mb-4">
                        <Search className="w-7 h-7 text-slate-200" />
                    </div>
                    <p className="text-[13px] text-slate-500 font-medium tracking-tight">
                        Aucune réservation ne correspond à vos critères.
                    </p>
                </div>
            )}

            {/* Pagination Component - يبقى كما هو */}
            {reservations.total > 0 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                    <p className="text-[12px] text-slate-400 font-medium">
                        Affichage de <span className="text-slate-900 font-bold">{reservations.from}-{reservations.to}</span> sur {reservations.total}
                    </p>
                    <div className="flex items-center gap-1">
                        {reservations.links
                            ?.filter((l) => l.url || l.label.includes("Ellipsis"))
                            .map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || "#"}
                                    as={link.url ? "a" : "span"}
                                    className={cn(
                                        "px-3 py-1 rounded-lg text-[12px] font-bold transition-all border",
                                        link.active
                                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                            : !link.url
                                            ? "text-slate-300 border-transparent pointer-events-none"
                                            : "text-slate-600 bg-white border-slate-200 hover:bg-slate-50"
                                    )}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label
                                            .replace("&laquo; Previous", "Préc.")
                                            .replace("Next &raquo;", "Suiv."),
                                    }}
                                />
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// الدوال المساعدة (نفس الدوال التي أرفقتها أنت)
function StatusDot({ status }: { status: string }) {
    const colors = {
        en_attente: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]",
        en_verification: "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]",
        valide: "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]",
        en_attente_paiement: "bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.5)]",
        paye_partiellement: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]",
        confirme: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]",
        annule: "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]",
    }[status] || "bg-slate-300";

    return <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", colors)} />;
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function formatPrice(amount: number) {
    return new Intl.NumberFormat("fr-MA", { style: "decimal" }).format(amount) + " MAD";
}

function getNightsText(r: Reservation) {
    const start = new Date(r.date_arrivee);
    const end = new Date(r.date_depart);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return `${diff} nuits`;
}

function getStatusBg(status: string) {
    const config = RESERVATION_STATUS_CONFIG.find((c) => c.value === status) || RESERVATION_STATUS_CONFIG[0];
    return `${config.bg} ${config.color}`;
}
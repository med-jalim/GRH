import { AdminLayout } from "@/Layouts/AdminLayout";
import { Link, router } from "@inertiajs/react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Tag,
  Trash2,
  User,
  Users,
  XCircle,
  Hash,
  BedDouble,
  FileText,
  RefreshCw,
  X,
  CreditCard,
  Plus,
  FileUp,
  ExternalLink,
  Wallet,
} from "lucide-react";
import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Hotel {
  id: number;
  name: string;
  ville: string;
  stars: number;
}

interface Type {
  id: number;
  nom: string;
}

interface ItemReservation {
  id: number;
  id_type: number;
  quantite: number;
  prix_unitaire: number;
  type: Type | null;
}

interface PaymentVerification {
  id: number;
  id_reservation: number;
  document_path: string;
  amount: number;
  created_at: string;
}

interface Reservation {
  id: number;
  code_reference: string;
  nom_agence: string | null;
  code_agence: string | null;
  nom_contact: string;
  email: string;
  telephone: string;
  id_hotel: number;
  date_arrivee: string;
  date_depart: string;
  nb_personnes: number;
  prix_total: number;
  remarques_speciales: string | null;
  statut: "en_attente" | "confirme" | "annule";
  code_reference_: string;
  created_at: string;
  updated_at: string;
  hotel: Hotel | null;
  details: ItemReservation[];
  payments: PaymentVerification[];
}

interface Props {
  reservation: Reservation;
}

// ── Helpers ────────────────────────────────────────────────────────────────

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
} as const;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
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

function nightsBetween(d1: string, d2: string) {
  const diff =
    new Date(d2).getTime() - new Date(d1).getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

// ── Section wrapper ────────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-amber-600" />
        </div>
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p
          className={`text-sm font-semibold text-slate-800 mt-0.5 ${
            mono ? "font-mono" : ""
          }`}
        >
          {value || <span className="text-slate-400 font-normal italic">—</span>}
        </p>
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ReservationShow({ reservation }: Props) {
  const cfg =
    STATUT_CONFIG[reservation.statut as keyof typeof STATUT_CONFIG] ??
    STATUT_CONFIG["en_attente"];
  const StatutIcon = cfg.icon;

  const [newStatut, setNewStatut] = useState(reservation.statut);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Payments logic
  const totalPaid = reservation.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, reservation.prix_total - totalPaid);
  const paidPercent = Math.min(100, (totalPaid / reservation.prix_total) * 100);

  // Cancellation modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");

  // Payment Add Modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(remaining.toString());
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const nights = nightsBetween(reservation.date_arrivee, reservation.date_depart);

  function handleStatusUpdate() {
    if (newStatut === reservation.statut) return;

    if (newStatut === "annule") {
      setCancelMessage("");
      setIsCancelModalOpen(true);
      return;
    }

    setUpdating(true);
    router.patch(
      `/admin/reservations/${reservation.id}/statut`,
      { statut: newStatut },
      { onFinish: () => setUpdating(false) }
    );
  }

  const confirmCancellation = () => {
    setUpdating(true);
    setIsCancelModalOpen(false);

    router.patch(
      `/admin/reservations/${reservation.id}/statut`,
      { statut: "annule", message: cancelMessage },
      {
        onFinish: () => {
          setUpdating(false);
        },
      }
    );
  };

  function handleDelete() {
    if (
      !confirm(
        `Supprimer définitivement la réservation ${reservation.code_reference} ?`
      )
    )
      return;
    setDeleting(true);
    router.delete(`/admin/reservations/${reservation.id}`);
  }

  function handleAddPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("document", paymentFile);
    formData.append("amount", paymentAmount);

    router.post(`/admin/reservations/${reservation.id}/payments`, formData, {
      onSuccess: () => {
        setIsPaymentModalOpen(false);
        setPaymentFile(null);
        setPaymentAmount(remaining.toString());
      },
      onFinish: () => setIsUploading(false),
    });
  }

  function handleDeletePayment(id: number) {
    if (!confirm("Supprimer ce justificatif ?")) return;
    router.delete(`/admin/payments/${id}`);
  }

  return (
    <AdminLayout>
      {/* ── Breadcrumb / Header ── */}
      <div className="mb-8">
        <Link
          href="/admin/reservations"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-amber-600 transition-colors mb-4 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux réservations
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Réservation
              </h1>
              <span className="font-mono text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-100">
                {reservation.code_reference}
              </span>
            </div>
            <p className="text-slate-500 text-sm">
              Créée le{" "}
              {new Date(reservation.created_at).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Status badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold ${cfg.badge}`}
          >
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            <StatutIcon className="w-4 h-4" />
            {cfg.label}
          </div>
        </div>
      </div>

      {/* ── Summary ribbon ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total",
            value: formatPrice(reservation.prix_total),
            color: "text-slate-900",
            bg: "bg-slate-100",
          },
          {
            label: "Déjà payé",
            value: formatPrice(totalPaid),
            color: "text-emerald-700",
            bg: "bg-emerald-50",
          },
          {
            label: "Reste à payer",
            value: formatPrice(remaining),
            color: remaining > 0 ? "text-amber-700" : "text-emerald-700",
            bg: remaining > 0 ? "bg-amber-50" : "bg-emerald-50",
          },
          {
            label: "Progression",
            value: `${paidPercent.toFixed(0)}%`,
            color: "text-indigo-700",
            bg: "bg-indigo-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] p-5 relative overflow-hidden group"
          >
            <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${s.bg.replace('bg-', 'bg-') === 'bg-emerald-50' ? 'bg-emerald-500' : s.bg.replace('bg-', 'bg-') === 'bg-amber-50' ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: s.label === "Progression" ? `${paidPercent}%` : '0%' }} />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">{s.label}</p>
            <p className={`text-xl font-black ${s.color} tracking-tight`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Contact info */}
          <Section title="Informations du contact" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoRow
                icon={User}
                label="Nom du contact"
                value={reservation.nom_contact}
              />
              <InfoRow
                icon={Tag}
                label="Agence"
                value={reservation.nom_agence || undefined}
              />
              <InfoRow
                icon={Hash}
                label="Code agence"
                value={reservation.code_agence || undefined}
                mono
              />
              <InfoRow icon={Mail} label="E-mail" value={reservation.email} />
              <InfoRow
                icon={Phone}
                label="Téléphone"
                value={reservation.telephone}
              />
            </div>
          </Section>

          {/* Stay details */}
          <Section title="Détails du séjour" icon={Calendar}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <InfoRow
                icon={Calendar}
                label="Date d'arrivée"
                value={formatDate(reservation.date_arrivee)}
              />
              <InfoRow
                icon={Calendar}
                label="Date de départ"
                value={formatDate(reservation.date_depart)}
              />
              <InfoRow
                icon={Users}
                label="Nombre de personnes"
                value={`${reservation.nb_personnes} personne${reservation.nb_personnes !== 1 ? "s" : ""}`}
              />
              <InfoRow
                icon={Building2}
                label="Hôtel"
                value={
                  reservation.hotel
                    ? `${reservation.hotel.name} — ${reservation.hotel.ville}`
                    : undefined
                }
              />
            </div>

            
          </Section>

          {/* Room items */}
          {reservation.details.length > 0 && (
            <Section title="Chambres / Types réservés" icon={BedDouble}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 text-xs text-slate-400 font-semibold uppercase tracking-wide">
                        Type de chambre
                      </th>
                      <th className="text-center py-2 text-xs text-slate-400 font-semibold uppercase tracking-wide">
                        Qté
                      </th>
                      <th className="text-right py-2 text-xs text-slate-400 font-semibold uppercase tracking-wide">
                        Prix unitaire
                      </th>
                      <th className="text-right py-2 text-xs text-slate-400 font-semibold uppercase tracking-wide">
                        Sous-total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {reservation.details.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <BedDouble className="w-3.5 h-3.5 text-indigo-500" />
                            </div>
                            <span className="font-medium text-slate-800">
                              {item.type?.nom ?? `Type #${item.id_type}`}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
                            {item.quantite}
                          </span>
                        </td>
                        <td className="py-3 text-right text-slate-600 text-xs">
                          {formatPrice(item.prix_unitaire)}
                        </td>
                        <td className="py-3 text-right font-semibold text-slate-800">
                          {formatPrice(item.quantite * item.prix_unitaire)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200">
                      <td colSpan={3} className="py-3 text-right text-sm font-bold text-slate-700">
                        Total
                      </td>
                      <td className="py-3 text-right text-base font-bold text-emerald-700">
                        {formatPrice(reservation.prix_total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Section>
          )}

          {/* Remarks */}
          {reservation.remarques_speciales && (
            <Section title="Remarques spéciales" icon={FileText}>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {reservation.remarques_speciales}
              </p>
            </Section>
          )}
          {/* Payments Section */}
          <Section title="Paiements et Justificatifs" icon={Wallet}>
             <div className="flex flex-col gap-6">
                {/* Statistics Banner */}
                <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">État du paiement</p>
                                <h3 className="text-3xl font-black text-white">{paidPercent.toFixed(0)}% <span className="text-sm font-medium text-slate-400 ml-1">réglé</span></h3>
                            </div>
                            <div className="text-right">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Reste à payer</p>
                                <p className="text-xl font-bold text-amber-400">{formatPrice(remaining)}</p>
                            </div>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full transition-all duration-1000" style={{ width: `${paidPercent}%` }} />
                        </div>
                    </div>
                </div>

                {/* List of payments */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Justificatifs versés</h4>
                        <button 
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Ajouter un justificatif
                        </button>
                    </div>

                    {reservation.payments.length === 0 ? (
                        <div className="border-2 border-dashed border-slate-100 rounded-3xl py-12 flex flex-col items-center justify-center text-center bg-slate-50/30">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 text-slate-200 border border-slate-50 shadow-sm">
                                <FileUp className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">Aucun document pour le moment</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {reservation.payments.map((p) => (
                                <div key={p.id} className="bg-white border border-slate-100 rounded-2xl p-4 group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                                <CreditCard className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">{formatPrice(p.amount)}</p>
                                                <p className="text-[10px] font-medium text-slate-400">{new Date(p.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDeletePayment(p.id)}
                                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <a 
                                        href={`/storage/${p.document_path}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-2 py-2 bg-slate-50 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-all"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Ouvrir le document
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
             </div>
          </Section>
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-6">
          {/* Status management */}
          <Section title="Gérer le statut" icon={RefreshCw}>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                  Statut actuel
                </label>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold ${cfg.badge}`}
                >
                  <StatutIcon className="w-4 h-4" />
                  {cfg.label}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                  Changer le statut
                </label>
                <select
                  value={newStatut}
                  onChange={(e) =>
                    setNewStatut(e.target.value as Reservation["statut"])
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-white transition"
                >
                  <option value="en_attente">En attente</option>
                  <option value="confirme">Confirmée</option>
                  <option value="annule">Annulée</option>
                </select>
              </div>

              <button
                onClick={handleStatusUpdate}
                disabled={updating || newStatut === reservation.statut}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`w-4 h-4 ${updating ? "animate-spin" : ""}`}
                />
                {updating ? "Mise à jour..." : "Enregistrer le statut"}
              </button>
            </div>
          </Section>

          {/* Hotel card */}
          {reservation.hotel && (
            <Section title="Hôtel concerné" icon={Building2}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    {reservation.hotel.name}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {reservation.hotel.ville}
                  </p>
                  <div className="flex items-center gap-0.5 mt-1.5">
                    {Array.from({ length: reservation.hotel.stars ?? 0 }).map(
                      (_, i) => (
                        <svg
                          key={i}
                          className="w-3.5 h-3.5 text-amber-400 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )
                    )}
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* Danger zone */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-red-100 bg-red-50/40">
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-red-500" />
              </div>
              <h2 className="text-sm font-bold text-red-700 uppercase tracking-wide">
                Zone de danger
              </h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                La suppression est définitive et effacera également tous les
                éléments associés à cette réservation.
              </p>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold rounded-xl border border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "Suppression..." : "Supprimer cette réservation"}
              </button>
            </div>
          </div>
        </div>
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
                    Ce message sera directement visible par le client dans l'email de notification automatique.
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
                className="flex-[1.5] px-6 py-3 rounded-2xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Confirmer l'annulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment Add Modal ── */}
      {isPaymentModalOpen && (
        <div role="dialog" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
            <form onSubmit={handleAddPayment}>
              {/* Header */}
              <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">
                      Vérification
                    </h3>
                    <p className="text-sm text-slate-500 font-medium">
                      Ajouter un justificatif
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="p-2.5 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-8 space-y-6">
                {/* Amount */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 tracking-tight">
                    Montant payé (MAD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 py-3 text-sm font-black focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 transition-all"
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 tracking-tight">
                    Document de preuve
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="payment-file"
                      required
                    />
                    <label 
                      htmlFor="payment-file"
                      className="w-full flex flex-col items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-all group"
                    >
                      <div className="w-12 h-12 bg-slate-50 group-hover:bg-indigo-50 rounded-xl flex items-center justify-center transition-colors">
                        <FileUp className={`w-6 h-6 ${paymentFile ? 'text-indigo-600' : 'text-slate-400'}`} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-600">
                          {paymentFile ? paymentFile.name : "Cliquez pour sélectionner"}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 font-medium">PDF, PNG ou JPG (Max 5MB)</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !paymentFile}
                  className="flex-[1.5] px-6 py-3 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isUploading ? "Envoi..." : "Valider le paiement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

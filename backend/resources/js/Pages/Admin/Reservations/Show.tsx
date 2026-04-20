import { AdminLayout } from "@/Layouts/AdminLayout";
import { Link, router, usePage } from "@inertiajs/react";
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
  ClipboardCheck,
  UserCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { StatusSelect, StatusValue } from "@/components/ui/status-select";

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

interface SubType {
  id: number;
  nom: string;
}

interface ItemReservation {
  id: number;
  id_group: number;
  id_type: number;
  id_sub_type: number;
  quantite: number;
  prix_unitaire: number;
  nb_adultes: number;
  nb_enfants: number;
  type: Type | null;
  sub_type?: SubType | null;
}

interface ReservationGroup {
  id: number;
  id_reservation: number;
  date_arrivee: string;
  date_depart: string;
  nb_personnes: number;
  remise_pourcentage: number | null;
  remise_montant: number | null;
  items: ItemReservation[];
}

interface PaymentVerification {
  id: number;
  id_reservation: number;
  document_path: string;
  amount: number;
  statut: "en_attente" | "valide" | "refuse";
  created_at: string;
}

interface Reservation {
  id: number;
  code_reference: string;
  type_reservant: 'agence' | 'groupe';
  remise_pourcentage: number | null;
  prix_avant_remise: number | null;
  nom_agence: string | null;
  code_agence: string | null;
  nom_contact: string;
  email: string;
  telephone: string;
  id_hotel: number;
  date_arrivee: string;
  date_depart: string;
  nb_personnes: number;
  taxe_sejour_total: number;
  prix_total: number;
  remarques_speciales: string | null;
  statut: "en_attente" | "en_attente_paiement" | "confirme" | "annule" | "en_validation" | "valide" | "partiellement_paye";
  payment_link: string | null;
  token: string | null;
  paid_amount: number;
  total_amount: number;
  code_reference_: string;
  created_at: string;
  updated_at: string;
  hotel: Hotel | null;
  groups: ReservationGroup[];
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
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Payments logic
  const totalPaid = reservation.payments.filter((p) => p.statut === 'valide').reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, reservation.prix_total - totalPaid);
  const paidPercent = Math.min(100, (totalPaid / reservation.prix_total) * 100);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");

  // Status Confirmation Modal
  const [isStatusConfirmModalOpen, setIsStatusConfirmModalOpen] = useState(false);
  const [candidateStatus, setCandidateStatus] = useState<StatusValue | null>(null);

  // Payment Delete Modal
  const [isDeletePaymentConfirmModalOpen, setIsDeletePaymentConfirmModalOpen] = useState(false);
  const [pendingDeletePaymentId, setPendingDeletePaymentId] = useState<number | null>(null);

  // Payment Rejection Modal
  const [isRejectPaymentModalOpen, setIsRejectPaymentModalOpen] = useState(false);
  const [pendingRejectPaymentId, setPendingRejectPaymentId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Reservation Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Payment Link state
  const [paymentLink, setPaymentLink] = useState(reservation.payment_link || "");

  // Payment Add Modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(remaining.toString());
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // New states for status-change payment link
  const [isPaymentLinkModalOpen, setIsPaymentLinkModalOpen] = useState(false);
  const [tempPaymentLink, setTempPaymentLink] = useState(reservation.payment_link || "");

  const [activeTab, setActiveTab] = useState<"general" | "payment">("general");
  const { errors } = usePage().props;


  // Reset payment amount to remaining each time the modal opens
  useEffect(() => {
    if (isPaymentModalOpen) {
      setPaymentAmount(remaining.toString());
    }
  }, [isPaymentModalOpen, remaining]);

  const firstArrival = reservation.groups.length > 0 
    ? reservation.groups.reduce((min: string, p: ReservationGroup) => p.date_arrivee < min ? p.date_arrivee : min, reservation.groups[0].date_arrivee)
    : "";
  const lastDeparture = reservation.groups.length > 0 
    ? reservation.groups.reduce((max: string, p: ReservationGroup) => p.date_depart > max ? p.date_depart : max, reservation.groups[0].date_depart)
    : "";

  function handleStatusUpdate(nextStatut: StatusValue) {
    if (nextStatut === reservation.statut) return;

    if (nextStatut === "annule") {
      setCancelMessage("");
      setIsCancelModalOpen(true);
      return;
    }

    if (nextStatut === "en_attente_paiement") {
      setTempPaymentLink(reservation.payment_link || "");
      setIsPaymentLinkModalOpen(true);
      return;
    }

    setCandidateStatus(nextStatut);
    setIsStatusConfirmModalOpen(true);
  }

  function confirmStatusUpdate() {
    if (!candidateStatus) return;

    if (candidateStatus === "en_attente_paiement" && !paymentLink.trim()) {
      alert("Le lien de paiement est obligatoire pour passer à ce statut. Veuillez le saisir dans l'onglet Paiement.");
      setIsStatusConfirmModalOpen(false);
      return;
    }

    setIsStatusConfirmModalOpen(false);
    setUpdating(true);

    router.patch(
      `/admin/reservations/${reservation.id}/statut`,
      { 
        statut: candidateStatus, 
        payment_link: candidateStatus === "en_attente_paiement" ? paymentLink : undefined 
      },
      { 
        onFinish: () => {
          setUpdating(false);
          setCandidateStatus(null);
        } 
      }
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

  const confirmPaymentLinkChange = () => {
    if (!tempPaymentLink.trim()) return;

    setUpdating(true);
    setIsPaymentLinkModalOpen(false);

    router.patch(
      `/admin/reservations/${reservation.id}/statut`,
      { statut: "en_attente_paiement", payment_link: tempPaymentLink },
      {
        onFinish: () => {
          setUpdating(false);
        },
      }
    );
  };

  function handleAssignPaymentLink() {
    if (!paymentLink.trim()) return;
    setUpdating(true);
    router.patch(
      `/admin/reservations/${reservation.id}/statut`,
      { statut: "en_attente_paiement", payment_link: paymentLink },
      { onFinish: () => setUpdating(false) }
    );
  }

  function handleDelete() {
    setIsDeleteModalOpen(true);
  }

  function confirmDelete() {
    setIsDeleteModalOpen(false);
    setDeleting(true);
    router.delete(`/admin/reservations/${reservation.id}`, {
      onFinish: () => setDeleting(false),
    });
  }

  function handleAddPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentFile) return;

    if (parseFloat(paymentAmount) > remaining) {
      alert(`Le montant ne peut pas dépasser le reste à payer (${remaining} MAD).`);
      return;
    }

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
    setPendingDeletePaymentId(id);
    setIsDeletePaymentConfirmModalOpen(true);
  }

  function confirmPaymentDeletion() {
    if (!pendingDeletePaymentId) return;

    router.delete(`/admin/payments/${pendingDeletePaymentId}`, {
      onFinish: () => {
        setIsDeletePaymentConfirmModalOpen(false);
        setPendingDeletePaymentId(null);
      },
    });
  }

  function handlePaymentStatut(id: number, statut: "valide" | "refuse") {
    if (statut === "refuse") {
      setPendingRejectPaymentId(id);
      setRejectReason("");
      setIsRejectPaymentModalOpen(true);
      return;
    }
    setUpdating(true);
    router.patch(
      `/admin/payments/${id}/statut`,
      { statut },
      { onFinish: () => setUpdating(false) }
    );
  }

  function confirmPaymentRejection() {
    if (!pendingRejectPaymentId) return;
    setUpdating(true);
    setIsRejectPaymentModalOpen(false);
    router.patch(
      `/admin/payments/${pendingRejectPaymentId}/statut`,
      { statut: "refuse", reason: rejectReason },
      {
        onFinish: () => {
          setUpdating(false);
          setPendingRejectPaymentId(null);
          setRejectReason("");
        }
      }
    );
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

          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border shadow-sm ${STATUT_CONFIG[reservation.statut as keyof typeof STATUT_CONFIG]?.badge || 'bg-slate-50 text-slate-700'}`}>
              {(() => {
                const Icon = STATUT_CONFIG[reservation.statut as keyof typeof STATUT_CONFIG]?.icon || Clock;
                return <Icon className="w-4 h-4" />;
              })()}
              <span className="text-sm font-bold tracking-wide">
                {STATUT_CONFIG[reservation.statut as keyof typeof STATUT_CONFIG]?.label || reservation.statut}
              </span>
            </div>

            {reservation.statut === 'en_attente' && (
                <button onClick={() => handleStatusUpdate('en_validation')} disabled={updating} className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-yellow-500/20 active:scale-95 disabled:opacity-50 transition-all">
                    <ClipboardCheck className="w-4 h-4" />
                    {updating ? "..." : "Valider"}
                </button>
            )}

            {reservation.statut === 'valide' && (
                <button onClick={() => handleStatusUpdate('en_attente_paiement')} disabled={updating} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50 transition-all">
                    <CreditCard className="w-4 h-4" />
                    {updating ? "..." : "Add paiement"}
                </button>
            )}

            {reservation.statut !== 'annule' && (
                <button onClick={() => handleStatusUpdate('annule')} disabled={updating} className="flex items-center gap-2 px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-sm font-bold shadow-inner border border-red-200 active:scale-95 disabled:opacity-50 transition-all">
                    <XCircle className="w-4 h-4" />
                    {updating ? "..." : "Annuler"}
                </button>
            )}
          </div>
        </div>
        {/* Tab Switcher */}
        <div className="flex items-center gap-1 mt-8 bg-slate-100 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "general"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <User className="w-4 h-4" />
            Informations Générales
          </button>
          <button
            onClick={() => setActiveTab("payment")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "payment"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-indigo-600/80"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Paiement & Règlement
          </button>
        </div>
      </div>

      {activeTab === "general" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* ── Left column ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Section title="Informations du contact" icon={User}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InfoRow icon={User} label="Type de Réservant" value={reservation.type_reservant === 'agence' ? '🏢 Agence de Voyage' : '👥 Groupe / Particulier'} />
                <InfoRow icon={User} label={reservation.type_reservant === 'agence' ? "Responsable du dossier" : "Chef de groupe"} value={reservation.nom_contact} />
                {reservation.type_reservant === 'agence' && (
                  <>
                    <Tag className="hidden" /> {/* Keep icon import active if needed */}
                    <InfoRow icon={Tag} label="Agence" value={reservation.nom_agence || undefined} />
                    <InfoRow icon={Hash} label="Code agence" value={reservation.code_agence || undefined} mono />
                  </>
                )}
                <InfoRow icon={Mail} label="E-mail" value={reservation.email} />
                <InfoRow icon={Phone} label="Téléphone" value={reservation.telephone} />
              </div>
            </Section>

            <Section title="Détails du séjour" icon={Calendar}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <InfoRow icon={Calendar} label="Première arrivée" value={firstArrival ? formatDate(firstArrival) : "—"} />
                <InfoRow icon={Calendar} label="Dernier départ" value={lastDeparture ? formatDate(lastDeparture) : "—"} />
                <InfoRow icon={Users} label="Total personnes" value={`${reservation.nb_personnes} personne${reservation.nb_personnes !== 1 ? "s" : ""}`} />
                <InfoRow icon={Building2} label="Hôtel" value={reservation.hotel ? `${reservation.hotel.name} — ${reservation.hotel.ville}` : undefined} />
              </div>
            </Section>

            {reservation.groups && reservation.groups.length > 0 && (
              <Section title="Groupes & Chambres réservés" icon={BedDouble}>
                <div className="space-y-10">
                  {reservation.groups.map((group, gIdx) => {
                    const groupNights = nightsBetween(group.date_arrivee, group.date_depart);
                    return (
                      <div key={group.id} className="animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Group Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center text-[10px] font-black shadow-lg shadow-slate-200">
                              {String(gIdx + 1).padStart(2, '0')}
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-slate-800">Groupe #{gIdx + 1}</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                {group.nb_personnes} voyageurs · {groupNights} nuit(s)
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50/80 px-4 py-2.5 rounded-2xl border border-slate-100 flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Arrivée</p>
                              <p className="text-xs font-bold text-slate-700">{new Date(group.date_arrivee).toLocaleString("fr-FR", {day: "2-digit",month: "2-digit",year: "numeric",})}</p>
                            </div>
                            <div className="w-px h-6 bg-slate-200" />
                            <div className="text-right">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Départ</p>
                              <p className="text-xs font-bold text-slate-700">{new Date(group.date_depart).toLocaleString("fr-FR", {day: "2-digit",month: "2-digit",year: "numeric",})}</p>
                            </div>
                          </div>
                        </div>

                        {/* Items Table for this Group */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-100">
                                <th className="text-left py-2 text-[10px] text-slate-400 font-black uppercase tracking-wider">Hébergement</th>
                                <th className="text-center py-2 text-[10px] text-slate-400 font-black uppercase tracking-wider">Quantité</th>
                                <th className="text-right py-2 text-[10px] text-slate-400 font-black uppercase tracking-wider">Prix / Nuit</th>
                                <th className="text-right py-2 text-[10px] text-slate-400 font-black uppercase tracking-wider">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {group.items.map((item) => {
                                const subTotal = item.prix_unitaire * item.quantite * groupNights;
                                return (
                                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors group">
                                    <td className="py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                          <BedDouble className="w-4 h-4" />
                                        </div>
                                        <div>
                                          <span className="font-bold text-slate-700 block text-sm">
                                            {item.type?.nom ?? `Type #${item.id_type}`}
                                            {item.sub_type && (
                                              <span className="text-[#54b172] ml-1.5 font-bold">
                                                ({item.sub_type.nom})
                                              </span>
                                            )}
                                          </span>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Prix unitaire: {formatPrice(item.prix_unitaire)}</span>
                                            <span className="h-1 w-1 bg-slate-300 rounded-full" />
                                            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">
                                              {item.nb_adultes}A {item.nb_enfants > 0 && `· ${item.nb_enfants}E`}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-4 text-center">
                                      <span className="inline-flex items-center justify-center px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-black">
                                        x{item.quantite}
                                      </span>
                                    </td>
                                    <td className="py-4 text-right">
                                      <p className="text-xs font-bold text-slate-700">{formatPrice(item.prix_unitaire)}</p>
                                    </td>
                                    <td className="py-4 text-right">
                                      <p className="font-black text-slate-900 text-sm">{formatPrice(subTotal)}</p>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Group Discount Badge */}
                        {group.remise_pourcentage && group.remise_pourcentage > 0 && (
                          <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center group/remise">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-sm font-black text-[10px]">
                                -{group.remise_pourcentage}%
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest leading-none">Remise Appliquée</p>
                                <p className="text-[9px] text-emerald-600 font-bold uppercase mt-1 tracking-tight">Pour un séjour de {groupNights} nuits</p>
                              </div>
                            </div>
                            <p className="text-sm font-black text-emerald-700 tracking-tighter">-{formatPrice(group.remise_montant || 0)}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Final Total Summary Card */}
                  {/* Price Breakdown Card */}
                  <div className="mt-8 bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200">
                    <div className="p-8 space-y-6">
                      {/* Breakdown Lines */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-slate-400">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sous-total Chambres</span>
                          <span className="text-sm font-bold text-white">{formatPrice(reservation.prix_avant_remise || (reservation.prix_total - (reservation.taxe_sejour_total || 0)))}</span>
                        </div>

                        {/* {reservation.type_reservant === 'agence' && reservation.remise_pourcentage && ( */}
                        {reservation.remise_pourcentage && reservation.remise_pourcentage > 0 && (
                          <div className="flex justify-between items-center text-emerald-400">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Remise</span>
                            <span className="text-sm font-black">- {formatPrice((reservation.prix_avant_remise || 0) - (reservation.prix_total - (reservation.taxe_sejour_total || 0)))}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-amber-400">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Taxe de séjour</span>
                          <span className="text-sm font-black">+ {formatPrice(reservation.taxe_sejour_total)}</span>
                        </div>
                      </div>

                      <div className="h-px bg-white/10" />

                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em]">Montant Total TTC</p>
                          <p className="text-slate-400 text-[10px] font-medium">Incluant taxes et remises agence</p>
                        </div>
                        <p className="text-4xl font-black text-[#54b172] tracking-tighter">
                          {formatPrice(reservation.prix_total)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {reservation.remarques_speciales && (
              <Section title="Remarques spéciales" icon={FileText}>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{reservation.remarques_speciales}</p>
              </Section>
            )}
          </div>

          {/* ── Right column ── */}
          <div className="flex flex-col gap-6">
            {reservation.hotel && (
              <Section title="Hôtel concerné" icon={Building2}>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{reservation.hotel.name}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{reservation.hotel.ville}</p>
                    <div className="flex items-center gap-0.5 mt-1.5">
                      {Array.from({ length: reservation.hotel.stars ?? 0 }).map((_, i) => (
                        <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>
            )}

            <div className="bg-white rounded-2xl border border-red-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-red-100 bg-red-50/40">
                <Trash2 className="w-4 h-4 text-red-500" />
                <h2 className="text-sm font-bold text-red-700 uppercase tracking-wide">Zone de danger</h2>
              </div>
              <div className="p-6">
                <button onClick={handleDelete} disabled={deleting} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold rounded-xl border border-red-200 transition-colors">
                  <Trash2 className="w-4 h-4" />
                  {deleting ? "Suppression..." : "Supprimer cette réservation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Summary ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total", value: formatPrice(reservation.prix_total), color: "text-slate-900", bg: "bg-slate-100" },
              { label: "Déjà payé", value: formatPrice(totalPaid), color: "text-emerald-700", bg: "bg-emerald-50" },
              { label: "Reste à payer", value: formatPrice(remaining), color: remaining > 0 ? "text-amber-700" : "text-emerald-700", bg: remaining > 0 ? "bg-amber-50" : "bg-emerald-50" },
              { label: "Progression", value: `${paidPercent.toFixed(0)}%`, color: "text-indigo-700", bg: "bg-indigo-50" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 relative overflow-hidden">
                <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${s.label === "Progression" ? 'bg-indigo-500' : 'bg-slate-200'}`} style={{ width: s.label === "Progression" ? `${paidPercent}%` : '0%' }} />
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1.5">{s.label}</p>
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <Section title="Paiements et Justificatifs" icon={Wallet}>
                <div className="flex flex-col gap-6">
                  <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative">
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase mb-1">État du paiement</p>
                        <h3 className="text-3xl font-black">{paidPercent.toFixed(0)}% <span className="text-sm font-medium text-slate-400 ml-1">réglé</span></h3>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 text-xs font-bold uppercase mb-1">Reste à payer</p>
                        <p className="text-xl font-bold text-amber-400">{formatPrice(remaining)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Justificatifs versés</h4>
                      {reservation.statut !== "confirme" && (
                        <button onClick={() => setIsPaymentModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20">
                          <Plus className="w-3.5 h-3.5" /> Ajouter un justificatif
                        </button>
                      )}
                    </div>

                    {reservation.payments.length === 0 ? (
                      <div className="border-2 border-dashed border-slate-100 rounded-3xl py-12 flex flex-col items-center justify-center text-center bg-slate-50/30 font-bold text-slate-400 uppercase text-xs">
                        <FileUp className="w-6 h-6 mb-4 text-slate-200" />
                        Aucun document pour le moment
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {reservation.payments.map((p) => (
                          <div key={p.id} className="bg-white border border-slate-100 rounded-2xl p-4 group hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><CreditCard className="w-5 h-5" /></div>
                                <div>
                                  <p className="text-xs font-bold text-slate-900">{formatPrice(p.amount)}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                      {p.statut === 'valide' && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Validé</span>}
                                      {p.statut === 'en_attente' && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">En attente</span>}
                                      {p.statut === 'refuse' && <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Refusé</span>}
                                      <span className="text-[10px] text-slate-400">
                                        {new Date(p.created_at).toLocaleString("fr-FR", {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit"
                                        }).replace(',', ' à')}
                                      </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 items-center">
                                  {p.statut === 'en_attente' && (
                                     <>
                                        <button onClick={() => handlePaymentStatut(p.id, 'valide')} className="p-1.5 text-slate-400 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 rounded transition-colors" title="Valider"><CheckCircle className="w-4 h-4" /></button>
                                        <button onClick={() => handlePaymentStatut(p.id, 'refuse')} className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded transition-colors" title="Refuser"><XCircle className="w-4 h-4" /></button>
                                     </>
                                  )}
                                  <button onClick={() => handleDeletePayment(p.id)} className="p-1.5 text-slate-300 hover:text-red-500 group-hover:opacity-100 opacity-0 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </div>
                            <a href={`/storage/${p.document_path}`} target="_blank" className="w-full flex items-center justify-center gap-2 py-2 bg-slate-50 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-all">
                              <ExternalLink className="w-3 h-3" /> Ouvrir le document
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Section>
            </div>

            <div className="flex flex-col gap-6">
              {/* reservation.statut === "en_attente" || reservation.statut === "en_attente_paiement"  */}
              {(reservation.statut === "en_attente" || reservation.statut === "en_attente_paiement") && (
                <Section title="Lien de paiement" icon={CreditCard}>
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Associez un lien de paiement pour envoyer l'email automatique avec le RIB.</p>
                    <div className="relative">
                      <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="url" value={paymentLink} onChange={(e) => setPaymentLink(e.target.value)} placeholder="https://payzone.ma/..." className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.payment_link ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} text-sm font-medium`} />
                    </div>
                    {errors.payment_link && (
                      <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 animate-pulse">{(errors.payment_link as any)}</p>
                    )}
                    <button onClick={handleAssignPaymentLink} disabled={updating || !paymentLink.trim()} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50">
                      <RefreshCw className={`w-4 h-4 ${updating ? "animate-spin" : ""}`} />
                      {updating ? "Traitement..." : "Affecter & Envoyer l'email"}
                    </button>
                  </div>
                </Section>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ── Reservation Delete Confirmation Modal ── */}
      {isDeleteModalOpen && (
        <div role="dialog" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    Supprimer
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    Cette réservation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-2.5 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 text-center">
               <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Trash2 className="w-10 h-10 text-red-500" />
               </div>
               <h4 className="text-lg font-bold text-slate-900 mb-2">Attention !</h4>
               <p className="text-slate-600 text-sm font-medium leading-relaxed px-4">
                  Voulez-vous supprimer définitivement la réservation <span className="font-bold text-red-600">{reservation.code_reference}</span> ?
                  Cette action est irréversible et effacera toutes les données associées.
               </p>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex items-center gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="flex-[1.5] px-6 py-3 rounded-2xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Status Change Confirmation Modal ── */}
      {isStatusConfirmModalOpen && candidateStatus && (
        <div role="dialog" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    Confirmation
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    Changement de statut requis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsStatusConfirmModalOpen(false)}
                className="p-2.5 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8">
              <div className="flex flex-col items-center gap-8 py-4">
                <div className="flex items-center gap-6 w-full justify-between">
                  {/* From */}
                  <div className="flex-1 flex flex-col items-center gap-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actuel</p>
                    <div className={`px-4 py-3 rounded-2xl text-xs font-bold w-full text-center border shadow-sm ${STATUT_CONFIG[reservation.statut as keyof typeof STATUT_CONFIG]?.badge}`}>
                      {STATUT_CONFIG[reservation.statut as keyof typeof STATUT_CONFIG]?.label}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="pt-6">
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
                      <RefreshCw className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>

                  {/* To */}
                  <div className="flex-1 flex flex-col items-center gap-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nouveau</p>
                    <div className={`px-4 py-3 rounded-2xl text-xs font-bold w-full text-center border shadow-sm ${STATUT_CONFIG[candidateStatus]?.badge}`}>
                      {STATUT_CONFIG[candidateStatus]?.label}
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
                        Le client recevra instantanément un e-mail avec les nouveaux détails de sa réservation.
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-500 text-center font-medium px-4">
                    Êtes-vous sûr de vouloir confirmer ce changement ? 
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex items-center gap-4">
              <button
                onClick={() => setIsStatusConfirmModalOpen(false)}
                className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                Annuler
              </button>
              <button
                onClick={confirmStatusUpdate}
                className="flex-[1.5] px-6 py-3 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4" />
                Confirmer le changement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment Delete Confirmation Modal ── */}
      {isDeletePaymentConfirmModalOpen && (
        <div role="dialog" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    Suppression
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    Justificatif de paiement
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDeletePaymentConfirmModalOpen(false)}
                className="p-2.5 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 text-center">
               <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Trash2 className="w-10 h-10 text-red-500" />
               </div>
               <h4 className="text-lg font-bold text-slate-900 mb-2">Attention !</h4>
               <p className="text-slate-600 text-sm font-medium leading-relaxed px-4">
                  Cette action est irréversible. Le montant versé sera déduit du total payé et le reste à payer sera recalculé.
               </p>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex items-center gap-4">
              <button
                onClick={() => setIsDeletePaymentConfirmModalOpen(false)}
                className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                Conserver
              </button>
              <button
                onClick={confirmPaymentDeletion}
                className="flex-[1.5] px-6 py-3 rounded-2xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* ── Payment Rejection Reason Modal ── */}
      {isRejectPaymentModalOpen && (
        <div role="dialog" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">Refus de virement</h3>
                  <p className="text-sm text-slate-500 font-medium">Expliquez la raison au client</p>
                </div>
              </div>
              <button
                onClick={() => setIsRejectPaymentModalOpen(false)}
                className="p-2.5 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600 focus:outline-none"
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
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Indiquez pourquoi le virement est refusé... ex: Montant incorrect, RIB erroné, document illisible, etc."
                  className="w-full h-36 rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-400/50 transition-all resize-none shadow-inner"
                  autoFocus
                />
                <div className="flex gap-2.5 items-start bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
                  <svg className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                    Ce message sera visible par le client dans l'email de refus automatique. Soyez clair et courtois.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex items-center gap-4">
              <button
                onClick={() => setIsRejectPaymentModalOpen(false)}
                className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                Ignorer
              </button>
              <button
                onClick={confirmPaymentRejection}
                disabled={!rejectReason.trim()}
                className="flex-[1.5] px-6 py-3 rounded-2xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <XCircle className="w-4 h-4" />
                Confirmer le refus
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
                    max={remaining}
                    min={1}
                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 py-3 text-sm font-black focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 transition-all font-mono"
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
                  className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
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
      {/* ── Payment Link Modal ── */}
      {isPaymentLinkModalOpen && (
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
                onClick={() => setIsPaymentLinkModalOpen(false)}
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
                  <svg className="w-4 h-4 text-indigo-600 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
                    Le client recevra ce lien par e-mail avec les instructions de règlement.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex items-center gap-4">
              <button
                onClick={() => setIsPaymentLinkModalOpen(false)}
                className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                Annuler
              </button>
              <button
                onClick={confirmPaymentLinkChange}
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
    </AdminLayout>
  );
}

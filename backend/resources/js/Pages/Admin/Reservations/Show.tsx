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
    new Intl.NumberFormat("fr-DZ", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(amount) + " د.ج"
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

  const nights = nightsBetween(reservation.date_arrivee, reservation.date_depart);

  function handleStatusUpdate() {
    if (newStatut === reservation.statut) return;
    setUpdating(true);
    router.patch(
      `/admin/reservations/${reservation.id}/statut`,
      { statut: newStatut },
      { onFinish: () => setUpdating(false) }
    );
  }

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
            label: "Nuits",
            value: `${nights} nuit${nights !== 1 ? "s" : ""}`,
            color: "text-indigo-700",
            bg: "bg-indigo-50",
          },
          {
            label: "Personnes",
            value: `${reservation.nb_personnes} pers.`,
            color: "text-blue-700",
            bg: "bg-blue-50",
          },
          {
            label: "Chambres réservées",
            value: `${reservation.details.length} type${reservation.details.length !== 1 ? "s" : ""}`,
            color: "text-violet-700",
            bg: "bg-violet-50",
          },
          {
            label: "Total",
            value: formatPrice(reservation.prix_total),
            color: "text-emerald-700",
            bg: "bg-emerald-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] p-4"
          >
            <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
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
    </AdminLayout>
  );
}

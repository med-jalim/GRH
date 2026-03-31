import { AdminLayout } from "@/Layouts/AdminLayout";
import { Link, router, useForm } from "@inertiajs/react";
import {
  ArrowLeft,
  BedDouble,
  Building2,
  CalendarCheck,
  Check,
  Edit3,
  MapPin,
  Plus,
  Star,
  Trash2,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Tag,
} from "lucide-react";
import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Type {
  id: number;
  nom: string;
  description: string | null;
}

interface Chambre {
  id: number;
  numero: string;
  id_type: number;
  type: Type | null;
}

interface Tarif {
  id: number;
  id_type: number;
  prix: number;
  date_debut: string;
  date_fin: string;
  type: Type | null;
}

interface Reservation {
  id: number;
  code_reference: string;
  nom_contact: string;
  date_arrivee: string;
  date_depart: string;
  statut: "en_attente" | "confirme" | "annule";
  prix_total: number;
}

interface Hotel {
  id: number;
  name: string;
  ville: string | null;
  stars: number | null;
  description: string | null;
  chambres: Chambre[];
  tarifs: Tarif[];
  reservations: Reservation[];
}

interface Props {
  hotel: Hotel;
  types: Type[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function StarRating({
  count,
  interactive = false,
  onChange,
}: {
  count: number | null;
  interactive?: boolean;
  onChange?: (n: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const n = count ?? 0;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = hover !== null ? i < hover : i < n;
        return (
          <Star
            key={i}
            className={`w-5 h-5 transition-colors ${
              filled ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"
            } ${interactive ? "cursor-pointer hover:scale-110" : ""}`}
            onClick={() => interactive && onChange?.(i + 1)}
            onMouseEnter={() => interactive && setHover(i + 1)}
            onMouseLeave={() => interactive && setHover(null)}
          />
        );
      })}
    </div>
  );
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("fr-DZ").format(n) + " د.ج";
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUT_CONFIG = {
  en_attente: { label: "En attente", icon: Clock, cls: "bg-amber-50 text-amber-700 border-amber-200" },
  confirme:   { label: "Confirmée",  icon: CheckCircle, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  annule:     { label: "Annulée",    icon: XCircle, cls: "bg-red-50 text-red-700 border-red-200" },
} as const;

// ── Edit Hotel Modal ───────────────────────────────────────────────────────

function EditHotelModal({
  hotel,
  onClose,
}: {
  hotel: Hotel;
  onClose: () => void;
}) {
  const { data, setData, put, processing, errors } = useForm({
    name: hotel.name,
    ville: hotel.ville ?? "",
    stars: String(hotel.stars ?? 3),
    description: hotel.description ?? "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    put(`/admin/hotels/${hotel.id}`, { onSuccess: onClose });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden z-10">
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Modifier l'hôtel</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={submit} className="px-7 py-6 flex flex-col gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Nom <span className="text-red-400">*</span></label>
            <input type="text" value={data.name} onChange={(e) => setData("name", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-slate-50 transition" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Ville</label>
              <input type="text" value={data.ville} onChange={(e) => setData("ville", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-slate-50 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Étoiles</label>
              <select value={data.stars} onChange={(e) => setData("stars", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-slate-50 transition">
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={String(n)}>{"★".repeat(n)} {n} étoile{n > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Description</label>
            <textarea value={data.description} onChange={(e) => setData("description", e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-slate-50 transition resize-none" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Annuler</button>
            <button type="submit" disabled={processing} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
              <Check className="w-4 h-4" />
              {processing ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────

function Section({ title, icon: Icon, count, children, action }: {
  title: string;
  icon: React.ElementType;
  count?: number;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4 text-amber-600" />
          </div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{title}</h2>
          {count !== undefined && (
            <span className="ml-1 px-2 py-0.5 bg-slate-200 text-slate-600 text-xs font-bold rounded-full">{count}</span>
          )}
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function HotelShow({ hotel, types }: Props) {
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Group rooms by type for display
  const chambresByType = hotel.chambres.reduce<Record<string, Chambre[]>>((acc, c) => {
    const key = c.type?.nom ?? `Type #${c.id_type}`;
    (acc[key] ??= []).push(c);
    return acc;
  }, {});

  function handleDeleteHotel() {
    if (!confirm(`Supprimer définitivement l'hôtel "${hotel.name}" ?`)) return;
    setDeleting(true);
    router.delete(`/admin/hotels/${hotel.id}`);
  }

  return (
    <AdminLayout>
      {showEdit && (
        <EditHotelModal hotel={hotel} onClose={() => setShowEdit(false)} />
      )}

      {/* ── Breadcrumb / Header ── */}
      <div className="mb-8">
        <Link
          href="/admin/hotels"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-amber-600 transition-colors mb-4 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux hôtels
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-amber-100">
              <Building2 className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{hotel.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                {hotel.ville && (
                  <span className="flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                    {hotel.ville}
                  </span>
                )}
                <StarRating count={hotel.stars} />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowEdit(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-xl transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Modifier
            </button>
            <button
              onClick={handleDeleteHotel}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? "..." : "Supprimer"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary strip ── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Chambres", value: hotel.chambres.length, icon: BedDouble, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "Tarifs actifs", value: hotel.tarifs.length, icon: Tag, color: "text-violet-700", bg: "bg-violet-50" },
          { label: "Dernières rés.", value: hotel.reservations.length, icon: CalendarCheck, color: "text-emerald-700", bg: "bg-emerald-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Description */}
          {hotel.description && (
            <Section title="À propos" icon={Building2}>
              <p className="text-sm text-slate-600 leading-relaxed">{hotel.description}</p>
            </Section>
          )}

          {/* Chambres */}
          <Section title="Chambres" icon={BedDouble} count={hotel.chambres.length}
            action={
              <Link href={`/admin/chambres?hotel=${hotel.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg transition-colors">
                <Plus className="w-3.5 h-3.5" /> Gérer
              </Link>
            }
          >
            {hotel.chambres.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Aucune chambre enregistrée.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {Object.entries(chambresByType).map(([typeName, rooms]) => (
                  <div key={typeName}>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{typeName}</p>
                    <div className="flex flex-wrap gap-2">
                      {rooms.map((c) => (
                        <span key={c.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100">
                          <BedDouble className="w-3 h-3" />
                          N° {c.numero}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Tarifs */}
          <Section title="Tarifs" icon={Tag} count={hotel.tarifs.length}
            action={
              <Link href={`/admin/tarifs?hotel=${hotel.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg transition-colors">
                <Plus className="w-3.5 h-3.5" /> Gérer
              </Link>
            }
          >
            {hotel.tarifs.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Aucun tarif défini.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 text-xs text-slate-400 font-semibold uppercase tracking-wide">Type</th>
                      <th className="text-right py-2 text-xs text-slate-400 font-semibold uppercase tracking-wide">Prix/nuit</th>
                      <th className="text-right py-2 text-xs text-slate-400 font-semibold uppercase tracking-wide">Période</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {hotel.tarifs.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 text-violet-700 text-xs font-semibold rounded-lg">
                            {t.type?.nom ?? `Type #${t.id_type}`}
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold text-emerald-700 text-sm">
                          {formatPrice(t.prix)}
                        </td>
                        <td className="py-3 text-right text-xs text-slate-500">
                          {formatDate(t.date_debut)} → {formatDate(t.date_fin)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </div>

        {/* ── Right ── */}
        <div className="flex flex-col gap-6">
          {/* Recent reservations */}
          <Section title="Réservations récentes" icon={CalendarCheck} count={hotel.reservations.length}>
            {hotel.reservations.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Aucune réservation.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {hotel.reservations.map((r) => {
                  const cfg = STATUT_CONFIG[r.statut as keyof typeof STATUT_CONFIG] ?? STATUT_CONFIG.en_attente;
                  const Icon = cfg.icon;
                  return (
                    <Link
                      key={r.id}
                      href={`/admin/reservations/${r.id}`}
                      className="flex items-start justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100 group"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-bold text-amber-600 truncate">
                          {r.code_reference}
                        </p>
                        <p className="text-xs text-slate-600 font-medium mt-0.5 truncate">{r.nom_contact}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatDate(r.date_arrivee)} → {formatDate(r.date_depart)}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border ${cfg.cls} flex-shrink-0`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </Link>
                  );
                })}

                <Link
                  href={`/admin/reservations?id_hotel=${hotel.id}`}
                  className="mt-1 text-xs text-center text-amber-600 hover:text-amber-700 font-semibold transition-colors"
                >
                  Voir toutes les réservations →
                </Link>
              </div>
            )}
          </Section>
        </div>
      </div>
    </AdminLayout>
  );
}

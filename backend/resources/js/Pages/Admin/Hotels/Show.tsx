import { AdminLayout } from "@/Layouts/AdminLayout";
import { Link, router, useForm } from "@inertiajs/react";
import {
  ArrowLeft,
  Building2,
  Edit3,
  MapPin,
  Star,
  Trash2,
  X,
  Check,
  LayoutDashboard,
  Layers,
  BedDouble,
  Tag,
  Calendar as CalendarIcon,
  Percent
} from "lucide-react";
import { useState } from "react";
import { ApercuTab } from "./Partials/ApercuTab";
import { TypesTab } from "./Partials/TypesTab";
import { ChambresTab } from "./Partials/ChambresTab";
import { TarifsTab } from "./Partials/TarifsTab";

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
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  rib: string | null;
  chambres: Chambre[];
  tarifs: Tarif[];
  reservations: Reservation[];
}

interface Tarification {
  id_type: number;
  type_nom: string | null;
  is_essentiel: boolean;
  pourcentage: number;
}

interface Props {
  hotel: Hotel;
  types: Type[];
  tarification: Tarification[];
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
    telephone: hotel.telephone ?? "",
    email: hotel.email ?? "",
    adresse: hotel.adresse ?? "",
    rib: hotel.rib ?? "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    put(`/admin/hotels/${hotel.id}`, { onSuccess: onClose });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Téléphone</label>
              <input type="text" value={data.telephone} onChange={(e) => setData("telephone", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-slate-50 transition" />
              {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
              <input type="email" value={data.email} onChange={(e) => setData("email", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-slate-50 transition" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Adresse</label>
            <input type="text" value={data.adresse} onChange={(e) => setData("adresse", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-slate-50 transition" />
            {errors.adresse && <p className="text-red-500 text-xs mt-1">{errors.adresse}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">R.I.B (24 Chiffres)</label>
            <input type="text" maxLength={24} value={data.rib} onChange={(e) => setData("rib", e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-slate-50 transition font-mono tracking-widest" />
            {errors.rib && <p className="text-red-500 text-xs mt-1">{errors.rib}</p>}
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

// ── Main Component ─────────────────────────────────────────────────────────

export default function HotelShow({ hotel, types, tarification }: Props) {
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Onglets State
  const [activeTab, setActiveTab] = useState<"apercu"|"types"|"chambres"|"calendrier"|"multiplicateurs">("apercu");

  // Group rooms by type for Apercu display
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

  const TABS = [
    { id: "apercu", label: "Aperçu Global", icon: LayoutDashboard },
    { id: "types", label: "Types de Chambres", icon: Layers },
    { id: "chambres", label: "Chambres", icon: BedDouble },
    { id: "calendrier", label: "Tarif Essentiel", icon: CalendarIcon },
    { id: "multiplicateurs", label: "Multiplicateurs", icon: Percent },
  ] as const;

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
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              <Edit3 className="w-4 h-4" />
              Modifier Hôtel
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

      {/* ── TABS NAVIGATION ── */}
      <div className="bg-white px-2 py-2 rounded-2xl shadow-sm border border-slate-100 flex gap-2 mb-6 overflow-x-auto custom-scrollbar">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${
                isActive 
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="min-h-[400px]">
        {activeTab === "apercu" && <ApercuTab hotel={hotel} chambresByType={chambresByType} />}
        {activeTab === "types" && <TypesTab types={types} />}
        {activeTab === "chambres" && <ChambresTab hotel={hotel} types={types} />}
        {activeTab === "calendrier" && (
          <TarifsTab section="calendrier" hotel={hotel} types={types} tarification={tarification} />
        )}
        {activeTab === "multiplicateurs" && (
          <TarifsTab section="multiplicateurs" hotel={hotel} types={types} tarification={tarification} />
        )}
      </div>

    </AdminLayout>
  );
}

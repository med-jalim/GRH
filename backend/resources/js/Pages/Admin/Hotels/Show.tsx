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
  Info,
  CreditCard,
  Settings2,
  Percent
} from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ApercuTab } from "./Partials/ApercuTab";
import { TypesTab } from "./Partials/TypesTab";
import { ChambresTab } from "./Partials/ChambresTab";
import { TarifsTab } from "./Partials/TarifsTab";
import { DiscountsTab } from "./Partials/DiscountsTab";

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
  statut: "en_attente" | "en_verification" | "valide" | "en_attente_paiement" | "paye_partiellement" | "confirme" | "annule";
  prix_total: number;
}

interface PricingRule {
  id_type: number;
  percentage: string | number;
  type?: Type;
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
  main_type_id: number | null;
  agency_price_percentage: number | null;
  group_price_percentage: number | null;
  tax_percentage: number | null;
  pricing_rules: PricingRule[];
  chambres: Chambre[];
  tarifs: Tarif[];
  reservations: Reservation[];
  discounts: any[];
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

// ── Edit Hotel Modal ───────────────────────────────────────────────────────

function EditHotelModal({
  hotel,
  onClose,
}: {
  hotel: Hotel;
  onClose: () => void;
}) {
  const [modalTab, setModalTab] = useState<"info" | "contact" | "settings">("info");
  
  const { data, setData, put, processing, errors } = useForm({
    name: hotel.name,
    ville: hotel.ville ?? "",
    stars: String(hotel.stars ?? 3),
    description: hotel.description ?? "",
    telephone: hotel.telephone ?? "",
    email: hotel.email ?? "",
    adresse: hotel.adresse ?? "",
    rib: hotel.rib ?? "",
    agency_price_percentage: String(hotel.agency_price_percentage ?? 100),
    group_price_percentage: String(hotel.group_price_percentage ?? 120),
    tax_percentage: String(hotel.tax_percentage ?? 0),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    put(`/admin/hotels/${hotel.id}`, { onSuccess: onClose });
  }

  const MODAL_TABS = [
    { id: "info", label: "Informations", icon: Info, countErrors: !!(errors.name || errors.stars) },
    { id: "contact", label: "Contact & Local.", icon: MapPin, countErrors: !!(errors.email || errors.telephone || errors.adresse) },
    { id: "settings", label: "Finance & Taxe", icon: Settings2, countErrors: !!(errors.rib || errors.agency_price_percentage || errors.group_price_percentage || errors.tax_percentage) },
  ] as const;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden z-10 border border-slate-100 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 shadow-sm">
              <Edit3 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Modifier l'établissement</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">{hotel.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-7 pt-5">
            <div className="flex p-1 bg-slate-50 rounded-xl gap-1 border border-slate-100">
                {MODAL_TABS.map((t) => {
                    const isActive = modalTab === t.id;
                    return (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setModalTab(t.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all relative ${
                                isActive 
                                    ? "bg-white text-amber-600 shadow-sm border border-slate-100" 
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <t.icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-500" : "text-slate-400"}`} />
                            <span className="hidden sm:inline">{t.label}</span>
                            {t.countErrors && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>

        <form onSubmit={submit} className="px-7 py-6">
          <div className="min-h-[320px] animate-in fade-in slide-in-from-bottom-2 duration-300">
            {modalTab === "info" && (
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide pl-1">Nom de l'hôtel <span className="text-red-400">*</span></label>
                        <input type="text" value={data.name} onChange={(e) => setData("name", e.target.value)} className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 text-sm font-semibold text-slate-700 ${errors.name ? 'border-red-200' : 'border-slate-200'}`} />
                        {errors.name && <p className="text-red-500 text-[10px] font-bold pl-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide pl-1">Ville</label>
                            <input type="text" value={data.ville} onChange={(e) => setData("ville", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 text-sm font-semibold text-slate-700" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide pl-1">Étoiles</label>
                            <select value={data.stars} onChange={(e) => setData("stars", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 text-sm font-bold text-slate-700">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <option key={n} value={String(n)}>{"★".repeat(n)} {n} étoile{n > 1 ? "s" : ""}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide pl-1">Description</label>
                        <textarea value={data.description} onChange={(e) => setData("description", e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 text-sm font-semibold text-slate-700 resize-none" placeholder="Courte description de l'établissement..." />
                    </div>
                </div>
            )}

            {modalTab === "contact" && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide pl-1">Téléphone</label>
                            <input type="text" value={data.telephone} onChange={(e) => setData("telephone", e.target.value)} className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 text-sm font-semibold text-slate-700 ${errors.telephone ? 'border-red-200' : 'border-slate-200'}`} />
                            {errors.telephone && <p className="text-red-500 text-[10px] font-bold pl-1">{errors.telephone}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide pl-1">Email</label>
                            <input type="email" value={data.email} onChange={(e) => setData("email", e.target.value)} className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 text-sm font-semibold text-slate-700 ${errors.email ? 'border-red-200' : 'border-slate-200'}`} />
                            {errors.email && <p className="text-red-500 text-[10px] font-bold pl-1">{errors.email}</p>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide pl-1">Adresse</label>
                        <input type="text" value={data.adresse} onChange={(e) => setData("adresse", e.target.value)} className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 text-sm font-semibold text-slate-700 ${errors.adresse ? 'border-red-200' : 'border-slate-200'}`} />
                        {errors.adresse && <p className="text-red-500 text-[10px] font-bold pl-1">{errors.adresse}</p>}
                    </div>
                </div>
            )}

            {modalTab === "settings" && (
                <div className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide pl-1 flex items-center gap-2">
                             R.I.B (24 Chiffres)
                        </label>
                        <input type="text" maxLength={24} value={data.rib} onChange={(e) => setData("rib", e.target.value.replace(/\D/g, ''))} className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 text-sm font-bold text-slate-700 font-mono tracking-widest ${errors.rib ? 'border-red-200' : 'border-slate-200'}`} />
                        {errors.rib && <p className="text-red-500 text-[10px] font-bold pl-1">{errors.rib}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">% Agences</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number" min={0} max={999} step={0.5}
                                    value={data.agency_price_percentage}
                                    onChange={(e) => setData("agency_price_percentage", e.target.value)}
                                    className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-400/20 outline-none"
                                />
                                <span className="text-slate-400 font-bold text-xs">%</span>
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">% Groupes</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number" min={0} max={999} step={0.5}
                                    value={data.group_price_percentage}
                                    onChange={(e) => setData("group_price_percentage", e.target.value)}
                                    className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-400/20 outline-none"
                                />
                                <span className="text-slate-400 font-bold text-xs">%</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-2xl p-4 shadow-lg border border-slate-800">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 shadow-sm">
                                    <Percent className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-200 uppercase tracking-widest">Taxe de séjour</label>
                                    <p className="text-[9px] text-slate-500 font-bold mt-0.5">Calculée après remises</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
                                <input
                                    type="number" min={0} max={100} step={0.1}
                                    value={data.tax_percentage}
                                    onChange={(e) => setData("tax_percentage", e.target.value)}
                                    className="w-16 h-8 rounded-md bg-slate-950 border-none text-amber-400 text-sm font-black text-center focus:ring-1 focus:ring-amber-400/30"
                                />
                                <span className="text-slate-500 font-bold text-[10px] pr-1">%</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
          </div>

          <div className="flex gap-3 pt-6 mt-2 border-t border-slate-50">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-all">Annuler</button>
            <button type="submit" disabled={processing} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-amber-200 active:scale-95 disabled:opacity-50">
              <Check className="w-4 h-4" />
              {processing ? "Chargement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function HotelShow({ hotel, types }: Props) {
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Onglets State
  const [activeTab, setActiveTab] = useState<"apercu"|"types"|"chambres"|"tarifs"|"promotions">("apercu");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Group rooms by type for Apercu display
  const chambresByType = hotel.chambres.reduce<Record<string, Chambre[]>>((acc, c) => {
    const key = c.type?.nom ?? `Type #${c.id_type}`;
    (acc[key] ??= []).push(c);
    return acc;
  }, {});

  function handleConfirmDelete() {
    setConfirmDelete(false);
    setDeleting(true);
    router.delete(`/admin/hotels/${hotel.id}`);
  }

  const TABS = [
    { id: "apercu", label: "Aperçu Global", icon: LayoutDashboard },
    { id: "types", label: "Types & Tarification", icon: Layers },
    { id: "chambres", label: "Chambres", icon: BedDouble },
    { id: "tarifs", label: "Calendrier", icon: Tag },
    { id: "promotions", label: "Promotions", icon: Percent },
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
              onClick={() => setConfirmDelete(true)}
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

      <div className="min-h-[400px]">
        {activeTab === "apercu" && <ApercuTab hotel={hotel} chambresByType={chambresByType} />}
        {activeTab === "types" && <TypesTab hotel={hotel} types={types} />}
        {activeTab === "chambres" && <ChambresTab hotel={hotel} types={types} />}
        {activeTab === "tarifs" && <TarifsTab hotel={hotel} types={types} />}
        {activeTab === "promotions" && <DiscountsTab hotel={hotel} />}
      </div>

      <ConfirmDialog 
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleting}
        title="Supprimer l'établissement"
        description={`Êtes-vous sûr de vouloir supprimer l'hôtel "${hotel.name}" ? Toutes les données, prix et chambres associées seront perdus définitivement.`}
        confirmLabel="Supprimer définitivement"
        variant="danger"
      />

    </AdminLayout>
  );
}

import { AdminLayout } from "@/Layouts/AdminLayout";
import { Link, router, useForm } from "@inertiajs/react";
import {
  Building2,
  Plus,
  Search,
  Star,
  MapPin,
  BedDouble,
  CalendarCheck,
  Eye,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

// ── Types ──────────────────────────────────────────────────────────────────

interface Hotel {
  id: number;
  name: string;
  ville: string | null;
  stars: number | null;
  description: string | null;
  chambres_count: number;
  reservations_count: number;
}

interface Stats {
  total: number;
  villes: number;
  chambres: number;
  reservations: number;
}

interface Props {
  hotels: Hotel[];
  stats: Stats;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function StarRating({ count }: { count: number | null }) {
  const n = count ?? 0;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < n ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

// ── Create Modal ───────────────────────────────────────────────────────────

function CreateHotelModal({ onClose }: { onClose: () => void }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    ville: "",
    stars: "3",
    description: "",
    telephone: "",
    email: "",
    adresse: "",
    rib: "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post("/admin/hotels", {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Nouvel hôtel</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={submit} className="px-7 py-6 flex flex-col gap-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Nom de l'hôtel <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              placeholder="Ex : Hôtel El Djazaïr"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition bg-slate-50"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Ville + Stars */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Ville
              </label>
              <input
                type="text"
                value={data.ville}
                onChange={(e) => setData("ville", e.target.value)}
                placeholder="Ex : Alger"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition bg-slate-50"
              />
              {errors.ville && (
                <p className="text-red-500 text-xs mt-1">{errors.ville}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Étoiles
              </label>
              <select
                value={data.stars}
                onChange={(e) => setData("stars", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition bg-slate-50"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={String(n)}>
                    {"★".repeat(n)} {n} étoile{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={data.description}
              onChange={(e) => setData("description", e.target.value)}
              rows={3}
              placeholder="Courte description de l'établissement..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition bg-slate-50 resize-none"
            />
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Téléphone</label>
              <input
                type="text"
                value={data.telephone}
                onChange={(e) => setData("telephone", e.target.value)}
                placeholder="Ex : 0522..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-slate-50"
              />
              {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData("email", e.target.value)}
                placeholder="contact@hotel.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-slate-50"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Adresse</label>
            <input
              type="text"
              value={data.adresse}
              onChange={(e) => setData("adresse", e.target.value)}
              placeholder="Adresse complète"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-slate-50"
            />
            {errors.adresse && <p className="text-red-500 text-xs mt-1">{errors.adresse}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">R.I.B (24 Chiffres)</label>
            <input
              type="text"
              maxLength={24}
              value={data.rib}
              onChange={(e) => setData("rib", e.target.value.replace(/\D/g, ''))} // only digits
              placeholder="012345678901234567890123"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-slate-50 tracking-widest font-mono"
            />
            {errors.rib && <p className="text-red-500 text-xs mt-1">{errors.rib}</p>}
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
            >
              <Check className="w-4 h-4" />
              {processing ? "Création..." : "Créer l'hôtel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function HotelsIndex({ hotels, stats }: Props) {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number, name: string } | null>(null);

  const filtered = hotels.filter((h) => {
    const q = search.toLowerCase();
    return (
      h.name.toLowerCase().includes(q) ||
      (h.ville ?? "").toLowerCase().includes(q)
    );
  });

  function handleConfirmDelete() {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    router.delete(`/admin/hotels/${confirmDelete.id}`, {
      onFinish: () => {
        setConfirmDelete(null);
        setDeletingId(null);
      },
    });
  }

  return (
    <AdminLayout>
      {showCreate && <CreateHotelModal onClose={() => setShowCreate(false)} />}

      {/* ── Header ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hôtels</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {stats.total} établissement{stats.total !== 1 ? "s" : ""} enregistré{stats.total !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-amber-200 transition-all hover:shadow-lg hover:shadow-amber-200 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Ajouter un hôtel
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Hôtels", value: stats.total, icon: Building2, color: "text-indigo-700", bg: "bg-indigo-50" },
          { label: "Villes", value: stats.villes, icon: MapPin, color: "text-violet-700", bg: "bg-violet-50" },
          { label: "Chambres", value: stats.chambres, icon: BedDouble, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "Réservations", value: stats.reservations, icon: CalendarCheck, color: "text-emerald-700", bg: "bg-emerald-50" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] p-4 flex items-center gap-3"
          >
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

      {/* ── Search ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition bg-slate-50"
          />
        </div>
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center py-24 px-8 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">Aucun hôtel trouvé</h3>
          <p className="text-slate-400 mt-1 text-sm">
            {search ? "Essayez un autre terme de recherche." : "Commencez par ajouter un hôtel."}
          </p>
          {!search && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter un hôtel
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((hotel) => (
            <div
              key={hotel.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_-6px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col"
            >
              {/* Card gradient header */}
              <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-400" />

              <div className="p-5 flex flex-col flex-1">
                {/* Name + Stars */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 leading-tight">
                        {hotel.name}
                      </h3>
                      {hotel.ville && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-500">{hotel.ville}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <StarRating count={hotel.stars} />
                </div>

                {/* Description */}
                {hotel.description && (
                  <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                    {hotel.description}
                  </p>
                )}

                {/* Stats chips */}
                <div className="flex items-center gap-2 mt-auto mb-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg">
                    <BedDouble className="w-3.5 h-3.5" />
                    {hotel.chambres_count} chambre{hotel.chambres_count !== 1 ? "s" : ""}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg">
                    <CalendarCheck className="w-3.5 h-3.5" />
                    {hotel.reservations_count} rés.
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t border-slate-100 pt-4">
                  <Link
                    href={`/admin/hotels/${hotel.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Voir détails
                  </Link>
                  <button
                    disabled={deletingId === hotel.id}
                    onClick={() => setConfirmDelete({ id: hotel.id, name: hotel.name })}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deletingId === hotel.id ? "..." : "Supprimer"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog 
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deletingId !== null}
        title="Supprimer l'établissement"
        description={`Êtes-vous sûr de vouloir supprimer l'hôtel "${confirmDelete?.name}" ? Toutes les chambres et données liées seront effacées définitivement.`}
        confirmLabel="Confirmer la suppression"
        variant="danger"
      />
    </AdminLayout>
  );
}

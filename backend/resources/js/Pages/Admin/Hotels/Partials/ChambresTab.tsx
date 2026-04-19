import { useForm, router } from "@inertiajs/react";
import { BedDouble, Check, Edit3, Plus, Trash2, X, Search } from "lucide-react";
import { useState } from "react";

export function ChambresTab({ hotel, types }: { hotel: any; types: any[] }) {
  const [showModal, setShowModal] = useState(false);
  const [editingChambre, setEditingChambre] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredChambres = (hotel.chambres || []).filter((c: any) => {
    const matchesSearch = c.numero.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || c.id_type.toString() === filterType;
    return matchesSearch && matchesType;
  });

  const { data, setData, post, put, processing, errors, reset } = useForm({
    numero: "",
    id_type: types.length > 0 ? types[0].id.toString() : "",
    id_sub_type: "",
    id_hotel: hotel.id.toString(), // context
  });

  function openCreate() {
    setEditingChambre(null);
    reset();
    setData({
      numero: "",
      id_type: types.length > 0 ? types[0].id.toString() : "",
      id_sub_type: "",
      id_hotel: hotel.id.toString(),
    });
    setShowModal(true);
  }

  function openEdit(c: any) {
    setEditingChambre(c);
    setData({
      numero: c.numero,
      id_type: c.id_type.toString(),
      id_sub_type: c.id_sub_type?.toString() ?? "",
      id_hotel: hotel.id.toString(),
    });
    setShowModal(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (editingChambre) {
      put(`/admin/chambres/${editingChambre.id}`, {
        onSuccess: () => {
          setShowModal(false);
          reset();
        },
      });
    } else {
      post("/admin/chambres", {
        onSuccess: () => {
          setShowModal(false);
          reset();
        },
      });
    }
  }

  function handleDelete(id: number) {
    if (confirm("Supprimer cette chambre définitivement ?")) {
      router.delete(`/admin/chambres/${id}`);
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <BedDouble className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Liste des Chambres</h2>
            <p className="text-xs text-slate-500 mt-0.5">{hotel.chambres?.length || 0} chambres au total.</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Ajouter une chambre
        </button>
      </div>

      <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par numéro de chambre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition bg-white font-medium"
        >
          <option value="all">Tous les types ({hotel.chambres?.length || 0})</option>
          {types.map((t) => (
            <option key={t.id} value={t.id.toString()}>{t.nom}</option>
          ))}
        </select>
      </div>

      <div className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-6 py-3 text-xs text-slate-400 font-semibold uppercase tracking-wide">Numéro</th>
              <th className="text-left px-6 py-3 text-xs text-slate-400 font-semibold uppercase tracking-wide">Type assigné</th>
              <th className="text-left px-6 py-3 text-xs text-slate-400 font-semibold uppercase tracking-wide">Occupation</th>
              <th className="text-right px-6 py-3 text-xs text-slate-400 font-semibold uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredChambres.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  {searchQuery || filterType !== "all" 
                    ? "Aucune chambre ne correspond à vos filtres."
                    : "Aucune chambre trouvée pour cet hôtel."}
                </td>
              </tr>
            ) : (
              filteredChambres.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">N° {c.numero}</td>
                  <td className="px-6 py-4">
                    <span 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg border"
                      style={{
                        backgroundColor: (c.type?.color || "#6366f1") + "10",
                        color: c.type?.color || "#6366f1",
                        borderColor: (c.type?.color || "#6366f1") + "30"
                      }}
                    >
                      {c.type?.nom ?? `Type #${c.id_type}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {c.sub_type ? (
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          {c.sub_type.color && (
                            <div 
                              className="w-2 h-2 rounded-full border border-white shadow-sm flex-shrink-0" 
                              style={{ backgroundColor: c.sub_type.color }} 
                            />
                          )}
                          <span className="text-xs font-bold text-slate-600">
                            {c.sub_type.nom}
                          </span>
                        </div>
                        <span className="text-[9px] font-medium text-slate-400">
                          {c.sub_type.max_adults ?? 0}A max · {c.sub_type.max_children ?? 0}E max · {c.sub_type.capacity_total ?? 0} total
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300 italic">Non spécifié</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden z-10">
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{editingChambre ? "Modifier la chambre" : "Ajouter une chambre"}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={submit} className="p-7 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Numéro (ex: 201) <span className="text-red-400">*</span></label>
                <input type="text" value={data.numero} onChange={(e) => setData("numero", e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-slate-50 outline-none" />
                {errors.numero && <p className="text-red-500 text-xs mt-1">{errors.numero}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Type de chambre <span className="text-red-400">*</span></label>
                <select 
                  value={data.id_type} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setData((prev: any) => ({ ...prev, id_type: val, id_sub_type: "" }));
                  }} 
                  required 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-slate-50 outline-none"
                >
                  <option value="" disabled>-- Choisir le type --</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>{t.nom}</option>
                  ))}
                </select>
                {errors.id_type && <p className="text-red-500 text-xs mt-1">{errors.id_type}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Occupation spécifiée <span className="text-red-400">*</span></label>
                <select 
                  value={data.id_sub_type} 
                  onChange={(e) => setData("id_sub_type", e.target.value)} 
                  required 
                  disabled={!data.id_type}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-slate-50 outline-none disabled:opacity-50"
                >
                  <option value="" disabled>-- Choisir l'occupation --</option>
                  {types.find(t => t.id.toString() === data.id_type)?.sub_types?.map((st: any) => (
                    <option key={st.id} value={st.id}>{st.nom}</option>
                  ))}
                </select>
                {errors.id_sub_type && <p className="text-red-500 text-xs mt-1">{errors.id_sub_type}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={processing || types.length === 0} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                  <Check className="w-4 h-4" /> {processing ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

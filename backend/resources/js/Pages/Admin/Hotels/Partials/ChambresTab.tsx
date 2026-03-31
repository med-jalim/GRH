import { useForm, router } from "@inertiajs/react";
import { BedDouble, Check, Edit3, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

export function ChambresTab({ hotel, types }: { hotel: any; types: any[] }) {
  const [showModal, setShowModal] = useState(false);
  const [editingChambre, setEditingChambre] = useState<any>(null);

  const { data, setData, post, put, processing, errors, reset } = useForm({
    numero: "",
    id_type: types.length > 0 ? types[0].id.toString() : "",
    id_hotel: hotel.id.toString(), // context
  });

  function openCreate() {
    setEditingChambre(null);
    setData("numero", "");
    if (types.length > 0) setData("id_type", types[0].id.toString());
    setShowModal(true);
  }

  function openEdit(c: any) {
    setEditingChambre(c);
    setData({
      numero: c.numero,
      id_type: c.id_type.toString(),
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

      <div className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-6 py-3 text-xs text-slate-400 font-semibold uppercase tracking-wide">Numéro</th>
              <th className="text-left px-6 py-3 text-xs text-slate-400 font-semibold uppercase tracking-wide">Type assigné</th>
              <th className="text-right px-6 py-3 text-xs text-slate-400 font-semibold uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {!hotel.chambres || hotel.chambres.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-400">Aucune chambre trouvée pour cet hôtel.</td>
              </tr>
            ) : (
              hotel.chambres.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">N° {c.numero}</td>
                  <td className="px-6 py-4 text-slate-500">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 text-violet-700 text-xs font-semibold rounded-lg">
                      {c.type?.nom ?? `Type #${c.id_type}`}
                    </span>
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
                <select value={data.id_type} onChange={(e) => setData("id_type", e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-slate-50 outline-none">
                  {types.length === 0 && <option value="" disabled>Aucun type disponible, créez-en un d'abord.</option>}
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>{t.nom}</option>
                  ))}
                </select>
                {errors.id_type && <p className="text-red-500 text-xs mt-1">{errors.id_type}</p>}
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

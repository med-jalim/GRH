import { useForm, router } from "@inertiajs/react";
import { Check, Edit3, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

export function TypesTab({ types }: { types: any[] }) {
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);

  const { data, setData, post, put, processing, errors, reset } = useForm({
    nom: "",
    description: "",
  });

  function openCreate() {
    setEditingType(null);
    reset();
    setShowModal(true);
  }

  function openEdit(t: any) {
    setEditingType(t);
    setData({
      nom: t.nom,
      description: t.description || "",
    });
    setShowModal(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (editingType) {
      put(`/admin/types/${editingType.id}`, {
        onSuccess: () => {
          setShowModal(false);
          reset();
        },
      });
    } else {
      post("/admin/types", {
        onSuccess: () => {
          setShowModal(false);
          reset();
        },
      });
    }
  }

  function handleDelete(id: number) {
    if (confirm("Supprimer ce type ? Cela affectera toutes les chambres liées.")) {
      router.delete(`/admin/types/${id}`);
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
        <div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Types de Chambres</h2>
          <p className="text-xs text-slate-500 mt-0.5">Ces types sont partagés entre tous les hôtels.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      <div className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-6 py-3 text-xs text-slate-400 font-semibold uppercase tracking-wide">Nom</th>
              <th className="text-left px-6 py-3 text-xs text-slate-400 font-semibold uppercase tracking-wide">Description</th>
              <th className="text-right px-6 py-3 text-xs text-slate-400 font-semibold uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {types.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-400">Aucun type de chambre enregistré.</td>
              </tr>
            ) : (
              types.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{t.nom}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs w-1/2">{t.description || "-"}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(t)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10">
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{editingType ? "Modifier le type" : "Nouveau type"}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submit} className="p-7 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Nom <span className="text-red-400">*</span></label>
                <input type="text" value={data.nom} onChange={(e) => setData("nom", e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-slate-50 outline-none" placeholder="Ex: Suite Présidentielle" />
                {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea value={data.description} onChange={(e) => setData("description", e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-slate-50 outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={processing} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
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

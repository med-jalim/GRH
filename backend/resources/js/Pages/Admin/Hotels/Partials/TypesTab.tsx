import { useForm, router } from "@inertiajs/react";
import { Check, Edit3, Plus, Trash2, X } from "lucide-react";
import React, { useState } from "react";

export function TypesTab({ types, hotel }: { types: any[], hotel: any }) {
  const [activeTypeId, setActiveTypeId] = useState<number | null>(types[0]?.id || null);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [showSubTypeModal, setShowSubTypeModal] = useState(false);
  const [editingSubType, setEditingSubType] = useState<any>(null);
  const [currentTypeId, setCurrentTypeId] = useState<number | null>(null);

  const activeType = types.find(t => t.id === activeTypeId) || types[0];

  const { data, setData, post, put, processing, errors, reset } = useForm({
    nom: "",
    description: "",
    color: "#6366f1",
  });

  function openCreateSubType(typeId: number) {
    setCurrentTypeId(typeId);
    setEditingSubType(null);
    setShowSubTypeModal(true);
  }

  function openEditSubType(st: any) {
    setCurrentTypeId(st.id_type);
    setEditingSubType(st);
    setShowSubTypeModal(true);
  }

  function handleDeleteSubType(id: number) {
    if (confirm("Supprimer ce sous-type ?")) {
        router.delete(`/admin/sub_types/${id}`);
    }
  }

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
      color: t.color || "#6366f1",
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col lg:flex-row-reverse gap-6 min-h-[600px]">
      {/* ── Sidebar: Global Types (Right Side) ── */}
      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col h-full">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Global Types</h3>
            <button
              onClick={openCreate}
              className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors shadow-sm"
              title="Ajouter un type"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 max-h-[500px]">
            {types.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8 px-4 italic">Aucun type enregistré.</p>
            ) : (
              types.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTypeId(t.id)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left group ${
                    activeTypeId === t.id
                      ? "bg-amber-50 border border-amber-100 shadow-sm"
                      : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" 
                    style={{ backgroundColor: t.color || "#6366f1" }} 
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${activeTypeId === t.id ? "text-amber-900" : "text-slate-700"}`}>
                      {t.nom}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      {(t.sub_types || []).length} occupation{(t.sub_types || []).length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content: Selected Type Detail (Left Side) ── */}
      <div className="flex-1">
        {!activeType ? (
          <div className="h-full bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
               <Plus className="w-8 h-8 text-slate-200" />
            </div>
            <h3 className="text-lg font-bold text-slate-400">Sélectionnez ou créez un type</h3>
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header / Type Details */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-2xl shadow-sm border-2 border-white ring-1 ring-slate-100" 
                    style={{ backgroundColor: activeType.color || "#6366f1" }} 
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{activeType.nom}</h2>
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{activeType.description || "Aucune description fournie."}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => openEdit(activeType)}
                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                    title="Modifier le type global"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(activeType.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Supprimer le type global"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sub-types Section */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Occupations pour cet hôtel</h3>
                <button
                  onClick={() => openCreateSubType(activeType.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-amber-200"
                >
                  <Plus className="w-4 h-4" /> Ajouter une occupation
                </button>
              </div>

              <div className="p-6">
                {(activeType.sub_types || []).length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <p className="text-slate-400 mb-4 max-w-xs">Aucune occupation n'est définie pour ce type dans cet hôtel.</p>
                    <button
                      onClick={() => openCreateSubType(activeType.id)}
                      className="text-amber-600 text-sm font-bold hover:underline"
                    >
                      Ajouter maintenant
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeType.sub_types.map((st: any) => (
                      <div key={st.id} className="group relative bg-slate-50/50 hover:bg-white rounded-2xl border border-slate-100 hover:border-amber-200 p-5 transition-all hover:shadow-lg hover:shadow-slate-100 overflow-hidden">
                        {/* Status bar */}
                        <div 
                          className="absolute top-0 left-0 bottom-0 w-1 opacity-20 group-hover:opacity-100 transition-opacity" 
                          style={{ backgroundColor: st.color || "#f59e0b" }}
                        />
                        
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                             {st.color && (
                               <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: st.color }} />
                             )}
                             <h4 className="font-bold text-slate-800">{st.nom}</h4>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => openEditSubType(st)} 
                              className="p-1.5 text-slate-300 hover:text-amber-600 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteSubType(st.id)} 
                              className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <div className="w-full text-[11px] font-bold text-slate-500 flex items-center gap-2">
                            <span>{st.max_adults ?? 0}A max</span>
                            <span className="text-slate-300">|</span>
                            <span>{st.max_children ?? 0}E max</span>
                            <span className="text-slate-300">|</span>
                            <span>{st.capacity_total ?? 0} Total</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <TypeModal 
          editingType={editingType} 
          data={data} 
          setData={setData} 
          submit={submit} 
          processing={processing} 
          errors={errors} 
          onClose={() => setShowModal(false)} 
        />
      )}

      {showSubTypeModal && (
        <SubTypeModal 
          editingSubType={editingSubType}
          typeId={currentTypeId}
          hotelId={hotel.id}
          onClose={() => setShowSubTypeModal(false)}
        />
      )}
    </div>
  );
}

function TypeModal({ editingType, data, setData, submit, processing, errors, onClose }: any) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10">
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{editingType ? "Modifier le type" : "Nouveau type"}</h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
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
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Couleur Calendrier</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={data.color} onChange={(e) => setData("color", e.target.value)} className="w-12 h-12 rounded-xl border border-slate-200 cursor-pointer bg-white p-1" />
                  <input type="text" value={data.color} onChange={(e) => setData("color", e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 outline-none font-mono" placeholder="#000000" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={processing} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                  <Check className="w-4 h-4" /> {processing ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
    );
}

function SubTypeModal({ editingSubType, typeId, hotelId, onClose }: any) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        id_type: typeId || (editingSubType?.id_type ?? ""),
        id_hotel: hotelId,
        nom: editingSubType?.nom ?? "",
        color: editingSubType?.color ?? "#f59e0b", // default to amber
        max_adults: editingSubType?.max_adults ?? 2,
        max_children: editingSubType?.max_children ?? 0,
        capacity_total: editingSubType?.capacity_total ?? 2,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (editingSubType) {
            put(`/admin/sub_types/${editingSubType.id}`, {
                onSuccess: () => { onClose(); reset(); },
            });
        } else {
            post("/admin/sub_types", {
                onSuccess: () => { onClose(); reset(); },
            });
        }
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden z-10 flex flex-col max-h-[95vh]">
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 shrink-0">
              <h2 className="text-lg font-bold text-slate-800">{editingSubType ? "Modifier l'occupation" : "Nouvelle occupation"}</h2>
              <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submit} className="p-7 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Nom de l'occupation <span className="text-red-400">*</span></label>
                <input type="text" value={data.nom} onChange={(e) => setData("nom", e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-slate-50 outline-none" placeholder="Ex: GDH 2" />
                {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Couleur d'affichage</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={data.color} onChange={(e) => setData("color", e.target.value)} className="w-12 h-12 rounded-xl border border-slate-200 cursor-pointer bg-white p-1" />
                  <input type="text" value={data.color} onChange={(e) => setData("color", e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 outline-none font-mono tracking-tighter" placeholder="#f59e0b" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Max Adultes</label>
                  <input
                    type="number"
                    min={0}
                    value={data.max_adults}
                    onChange={(e) => setData("max_adults", Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-center focus:ring-2 focus:ring-amber-400/40 outline-none"
                  />
                  {errors.max_adults && <p className="text-red-500 text-xs mt-1">{errors.max_adults}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Max Enfants</label>
                  <input
                    type="number"
                    min={0}
                    value={data.max_children}
                    onChange={(e) => setData("max_children", Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-center focus:ring-2 focus:ring-amber-400/40 outline-none"
                  />
                  {errors.max_children && <p className="text-red-500 text-xs mt-1">{errors.max_children}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Capacité Totale</label>
                  <input
                    type="number"
                    min={0}
                    value={data.capacity_total}
                    onChange={(e) => setData("capacity_total", Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-center focus:ring-2 focus:ring-amber-400/40 outline-none"
                  />
                  {errors.capacity_total && <p className="text-red-500 text-xs mt-1">{errors.capacity_total}</p>}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={processing} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                  <Check className="w-4 h-4" /> {processing ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
    );
}

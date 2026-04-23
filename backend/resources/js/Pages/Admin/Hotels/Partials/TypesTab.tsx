import { useForm, router } from "@inertiajs/react";
import {
    Check,
    Edit3,
    Plus,
    Trash2,
    X,
    Info,
    Users,
    User,
    Baby,
    ChevronRight,
    Search,
} from "lucide-react";
import { useState, useMemo } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Type {
    id: number;
    nom: string;
    description: string | null;
    color: string | null;
}

interface TypeCapacity {
    id?: number;
    id_type: number;
    label: string | null;
    capacite_adultes: number;
    capacite_enfants: number;
    capacite_totale: number;
}

interface Hotel {
    id: number;
    type_capacities: TypeCapacity[];
}

interface Props {
    hotel: Hotel;
    types: Type[];
}

export function TypesTab({ hotel, types }: Props) {
    // --- State ---
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(types[0]?.id || null);
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [editingType, setEditingType] = useState<Type | null>(null);
    const [confirmDeleteType, setConfirmDeleteType] = useState<Type | null>(null);

    const [showCapacityModal, setShowCapacityModal] = useState(false);
    const [editingCapacity, setEditingCapacity] = useState<TypeCapacity | null>(null);
    const [confirmDeleteCapacity, setConfirmDeleteCapacity] = useState<TypeCapacity | null>(null);

    // --- Forms ---
    const typeForm = useForm({
        nom: "",
        description: "",
        color: "#f59e0b", // Amber default
    });

    const capacityForm = useForm({
        id_type: selectedTypeId || 0,
        label: "",
        capacite_adultes: 2,
        capacite_enfants: 0,
        capacite_totale: 2,
    });

    // --- Derived Data ---
    const selectedType = types.find(t => t.id === selectedTypeId);
    const filteredCapacities = useMemo(() => {
        return hotel.type_capacities.filter(c => c.id_type === selectedTypeId);
    }, [hotel.type_capacities, selectedTypeId]);

    // --- Type Actions ---
    function openCreateType() {
        setEditingType(null);
        typeForm.reset();
        setShowTypeModal(true);
    }

    function openEditType(t: Type) {
        setEditingType(t);
        typeForm.setData({
            nom: t.nom,
            description: t.description || "",
            color: t.color || "#f59e0b",
        });
        setShowTypeModal(true);
    }

    function submitType(e: React.FormEvent) {
        e.preventDefault();
        if (editingType) {
            typeForm.put(`/admin/types/${editingType.id}`, {
                onSuccess: () => setShowTypeModal(false),
            });
        } else {
            typeForm.post("/admin/types", {
                onSuccess: () => setShowTypeModal(false),
            });
        }
    }

    function handleDeleteType() {
        if (!confirmDeleteType) return;
        router.delete(`/admin/types/${confirmDeleteType.id}`, {
            onSuccess: () => setConfirmDeleteType(null),
        });
    }

    // --- Capacity Actions ---
    function openCreateCapacity() {
        if (!selectedTypeId) return;
        setEditingCapacity(null);
        capacityForm.setData({
            id_type: selectedTypeId,
            label: "",
            capacite_adultes: 2,
            capacite_enfants: 0,
            capacite_totale: 2,
        });
        setShowCapacityModal(true);
    }

    function openEditCapacity(cap: TypeCapacity) {
        setEditingCapacity(cap);
        capacityForm.setData({
            id_type: cap.id_type,
            label: cap.label || "",
            capacite_adultes: cap.capacite_adultes,
            capacite_enfants: cap.capacite_enfants,
            capacite_totale: cap.capacite_totale || (cap.capacite_adultes + cap.capacite_enfants),
        });
        setShowCapacityModal(true);
    }

    function submitCapacity(e: React.FormEvent) {
        e.preventDefault();
        if (editingCapacity && editingCapacity.id) {
            capacityForm.put(`/admin/hotels/${hotel.id}/type-capacities/${editingCapacity.id}/update`, {
                onSuccess: () => setShowCapacityModal(false),
            });
        } else {
            capacityForm.post(`/admin/hotels/${hotel.id}/type-capacities/store`, {
                onSuccess: () => setShowCapacityModal(false),
            });
        }
    }

    function handleDeleteCapacity() {
        if (!confirmDeleteCapacity || !confirmDeleteCapacity.id) return;
        router.delete(`/admin/hotels/${hotel.id}/type-capacities/${confirmDeleteCapacity.id}`, {
            onSuccess: () => {
                setConfirmDeleteCapacity(null);
                setShowCapacityModal(false);
            },
        });
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* 1. Category Sidebar */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div>
                                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Types de Chambres</h2>
                                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{types.length} enregistrés</p>
                            </div>
                            <button
                                onClick={openCreateType}
                                className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all shadow-sm group"
                                title="Nouveau Type"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-3 max-h-[600px] overflow-y-auto custom-scrollbar space-y-2">
                            {types.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-xs italic">Aucun type enregistré.</div>
                            ) : (
                                types.map((t) => {
                                    const isActive = selectedTypeId === t.id;
                                    const count = hotel.type_capacities.filter(c => c.id_type === t.id).length;
                                    return (
                                        <div
                                            key={t.id}
                                            onClick={() => setSelectedTypeId(t.id)}
                                            className={`group p-3 rounded-xl transition-all cursor-pointer border relative ${
                                                isActive 
                                                    ? 'bg-amber-50 border-amber-200 text-amber-900 shadow-sm' 
                                                    : 'bg-white border-transparent hover:bg-slate-50 border-slate-100'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-1 h-10 rounded-full shrink-0"
                                                    style={{ backgroundColor: t.color || "#f59e0b" }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className={`text-sm font-bold truncate ${isActive ? 'text-amber-900' : 'text-slate-800'}`}>
                                                            {t.nom}
                                                        </h4>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-amber-200 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                                            {count}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-medium">{t.description || "Aucune description"}</p>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openEditType(t); }}
                                                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-amber-100"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Detail View */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {selectedType ? (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shadow-sm">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">{selectedType.nom}</h3>
                                        <p className="text-xs text-slate-500 font-medium">Configurations de capacité et d'occupation</p>
                                    </div>
                                </div>
                                <button
                                    onClick={openCreateCapacity}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-95"
                                >
                                    <Plus className="w-4 h-4" />
                                    Ajouter Configuration
                                </button>
                            </div>

                            {/* Configurations Table */}
                            <div className="flex-1 overflow-x-auto p-4">
                                {filteredCapacities.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <Search className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-500">Aucune configuration</p>
                                        <p className="text-xs font-medium opacity-60">Ajoutez une capacité pour commencer.</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-separate border-spacing-y-2">
                                        <thead>
                                            <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4">
                                                <th className="pb-3 pl-4">Configuration</th>
                                                <th className="pb-3 text-center">Occupation (Ad/En)</th>
                                                <th className="pb-3 text-center">Total Pax</th>
                                                <th className="pb-3 text-right pr-6">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredCapacities.map((cap) => (
                                                <tr 
                                                    key={cap.id} 
                                                    onClick={() => openEditCapacity(cap)}
                                                    className="group bg-white hover:bg-slate-50 border border-slate-100 rounded-xl transition-all cursor-pointer shadow-sm border-y"
                                                >
                                                    <td className="py-4 pl-4 rounded-l-xl border-y border-l border-slate-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs border border-amber-100">
                                                                {cap.label?.substring(0, 1).toUpperCase() || "C"}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-slate-800">{cap.label}</div>
                                                                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-tighter">ID: #{cap.id}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-center border-y border-slate-100">
                                                        <div className="flex items-center justify-center gap-4">
                                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100">
                                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                                <span className="text-xs font-bold text-slate-700">{cap.capacite_adultes}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100">
                                                                <Baby className="w-3.5 h-3.5 text-slate-400" />
                                                                <span className="text-xs font-bold text-slate-700">{cap.capacite_enfants}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-center border-y border-slate-100">
                                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 font-bold text-xs">
                                                            {cap.capacite_totale || (cap.capacite_adultes + cap.capacite_enfants)} Pax
                                                        </div>
                                                    </td>
                                                    <td className="py-4 pr-4 text-right rounded-r-xl border-y border-r border-slate-100">
                                                        <div className="flex justify-end pr-2">
                                                            <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-amber-500 group-hover:border-amber-500 group-hover:text-white transition-all">
                                                                <ChevronRight className="w-4 h-4" />
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-50/50 border border-dashed border-slate-200 rounded-xl text-slate-400 p-12">
                            <Info className="w-10 h-10 text-slate-300 mb-4" />
                            <h3 className="text-slate-800 font-bold text-base mb-1">Sélectionnez un type</h3>
                            <p className="text-xs text-center max-w-xs font-medium">Choisissez un type de chambre dans la colonne de gauche.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Modals --- */}

            {/* Capacity Modal */}
            {showCapacityModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCapacityModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                                        {editingCapacity ? "Modifier Configuration" : "Nouvelle Configuration"}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">{selectedType?.nom}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowCapacityModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitCapacity} className="p-7 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide ml-1">Label Affiché</label>
                                <input
                                    type="text"
                                    value={capacityForm.data.label}
                                    onChange={e => capacityForm.setData('label', e.target.value)}
                                    placeholder="Ex: Standard Double, Single Room..."
                                    className="w-full px-4 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide ml-1">Adultes</label>
                                    <CapacityStepper 
                                        value={capacityForm.data.capacite_adultes} 
                                        onChange={v => capacityForm.setData('capacite_adultes', v)} 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide ml-1">Enfants</label>
                                    <CapacityStepper 
                                        value={capacityForm.data.capacite_enfants} 
                                        onChange={v => capacityForm.setData('capacite_enfants', v)} 
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-xs font-bold text-slate-800 uppercase tracking-tight">Capacité Totale (Max Pax)</label>
                                        <p className="text-[10px] text-slate-500 font-medium">Nombre total de personnes autorisées (Hors bébés)</p>
                                    </div>
                                    <div className="w-24">
                                        <CapacityStepper 
                                            value={capacityForm.data.capacite_totale} 
                                            onChange={v => capacityForm.setData('capacite_totale', v)} 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-between gap-4">
                                {editingCapacity && (
                                    <button
                                        type="button"
                                        onClick={() => setConfirmDeleteCapacity(editingCapacity)}
                                        className="inline-flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-700 h-10 px-4 rounded-xl transition-all hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Supprimer
                                    </button>
                                )}
                                <div className="flex-1 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCapacityModal(false)}
                                        className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={capacityForm.processing}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                    >
                                        <Check className="w-4 h-4" />
                                        {capacityForm.processing ? "Enregistrement..." : "Enregistrer"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Type Modal */}
            {showTypeModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowTypeModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 tracking-tight uppercase">
                                {editingType ? "Modifier le type" : "Nouveau type"}
                            </h2>
                            <button onClick={() => setShowTypeModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={submitType} className="p-7 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide pl-1">Nom du Type</label>
                                <input
                                    type="text"
                                    value={typeForm.data.nom}
                                    onChange={e => typeForm.setData("nom", e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                    placeholder="Ex: Chambre Deluxe"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide pl-1">Description</label>
                                <textarea
                                    value={typeForm.data.description}
                                    onChange={e => typeForm.setData("description", e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide pl-1">Couleur</label>
                                <input
                                    type="color"
                                    value={typeForm.data.color}
                                    onChange={e => typeForm.setData("color", e.target.value)}
                                    className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer overflow-hidden p-0"
                                />
                            </div>

                            <div className="pt-2 flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={typeForm.processing}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95"
                                >
                                    <Check className="w-4 h-4" />
                                    {typeForm.processing ? "Traitement..." : "Enregistrer Type"}
                                </button>
                                {editingType && (
                                    <button
                                        type="button"
                                        onClick={() => setConfirmDeleteType(editingType)}
                                        className="w-full text-xs font-bold text-red-500 hover:text-red-700 px-4 py-2 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        Supprimer ce type
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!confirmDeleteType}
                onClose={() => setConfirmDeleteType(null)}
                onConfirm={handleDeleteType}
                title="Supprimer le type"
                description={`Êtes-vous sûr de vouloir supprimer "${confirmDeleteType?.nom}" ?`}
                confirmLabel="Supprimer"
                variant="danger"
            />

            <ConfirmDialog
                isOpen={!!confirmDeleteCapacity}
                onClose={() => setConfirmDeleteCapacity(null)}
                onConfirm={handleDeleteCapacity}
                title="Supprimer la configuration"
                description={`Êtes-vous sûr de vouloir supprimer "${confirmDeleteCapacity?.label}" ?`}
                confirmLabel="Supprimer"
                variant="danger"
            />
        </div>
    );
}

function CapacityStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button
                type="button"
                onClick={() => onChange(Math.max(0, value - 1))}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all font-bold text-lg"
            >
                -
            </button>
            <span className="text-xs font-bold text-slate-700">
                {value}
            </span>
            <button
                type="button"
                onClick={() => onChange(value + 1)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all font-bold text-lg"
            >
                +
            </button>
        </div>
    );
}

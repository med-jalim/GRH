import { useForm, router } from "@inertiajs/react";
import {
    Check,
    Edit3,
    Plus,
    Trash2,
    X,
    Info,
    Percent,
} from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Users } from "lucide-react";

interface Type {
    id: number;
    nom: string;
    description: string | null;
    color: string | null;
}

interface PricingRule {
    id_type: number;
    percentage: string | number;
}

interface Hotel {
    id: number;
    main_type_id: number | null;
    pricing_rules: PricingRule[];
    type_capacities: {
        id_type: number;
        capacite_adultes: number;
        capacite_enfants: number;
        capacite_bebes: number;
    }[];
}

interface Props {
    hotel: Hotel;
    types: Type[];
}

export function TypesTab({ hotel, types }: Props) {
    // --- Global Type Management ---
    const [showModal, setShowModal] = useState(false);
    const [editingType, setEditingType] = useState<any>(null);
    const [confirmDelete, setConfirmDelete] = useState<{
        id: number;
        nom: string;
    } | null>(null);
    const [deleting, setDeleting] = useState(false);

    const typeForm = useForm({
        nom: "",
        description: "",
        color: "#6366f1",
    });

    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(types[0]?.id || null);

    // --- Hotel Pricing Rules Management ---
    const pricingForm = useForm({
        main_type_id: hotel.main_type_id ?? "",
        rules: types.map((t) => {
            const existingRule = hotel.pricing_rules.find(
                (r) => r.id_type === t.id,
            );
            return {
                id_type: t.id,
                nom: t.nom,
                percentage: existingRule ? existingRule.percentage : "100",
            };
        }),
    });

    // --- Hotel Capacities Management ---
    const capacityForm = useForm({
        capacities: types.map((t) => {
            const existingCap = hotel.type_capacities?.find(
                (c) => c.id_type === t.id,
            );
            return {
                id_type: t.id,
                nom: t.nom,
                capacite_adultes: existingCap ? existingCap.capacite_adultes : 2,
                capacite_enfants: existingCap ? existingCap.capacite_enfants : 2,
                capacite_bebes: existingCap ? existingCap.capacite_bebes : 0,
            };
        }),
    });

    function openCreate() {
        setEditingType(null);
        typeForm.reset();
        setShowModal(true);
    }

    function openEdit(t: any) {
        setEditingType(t);
        typeForm.setData({
            nom: t.nom,
            description: t.description || "",
            color: t.color || "#6366f1",
        });
        setShowModal(true);
    }

    function submitType(e: React.FormEvent) {
        e.preventDefault();
        if (editingType) {
            typeForm.put(`/admin/types/${editingType.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    typeForm.reset();
                },
            });
        } else {
            typeForm.post("/admin/types", {
                onSuccess: () => {
                    setShowModal(false);
                    typeForm.reset();
                },
            });
        }
    }

    function saveAll() {
        pricingForm.put(`/admin/hotels/${hotel.id}/pricing-rules`, {
            preserveScroll: true,
            onSuccess: () => {
                capacityForm.put(`/admin/hotels/${hotel.id}/type-capacities`, {
                    preserveScroll: true,
                });
            }
        });
    }

    function handleConfirmDelete() {
        if (!confirmDelete) return;
        setDeleting(true);
        router.delete(`/admin/types/${confirmDelete.id}`, {
            onFinish: () => {
                setConfirmDelete(null);
                setDeleting(false);
            },
        });
    }

    const selectedType = types.find(t => t.id === selectedTypeId);
    const selectedPricingIndex = pricingForm.data.rules.findIndex(r => r.id_type === selectedTypeId);
    const selectedCapacityIndex = capacityForm.data.capacities.findIndex(c => c.id_type === selectedTypeId);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Configuration Panel (Left/Main - 2/3) */}
                <div className="lg:col-span-2">
                    {selectedType ? (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in zoom-in-95 duration-300">
                                {/* Header with unified save */}
                                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div 
                                            className="w-1.5 h-10 rounded-full" 
                                            style={{ backgroundColor: selectedType.color || '#6366f1' }} 
                                        />
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 leading-tight">
                                                {selectedType.nom}
                                            </h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Configuration du type</p>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={saveAll}
                                        disabled={pricingForm.processing || capacityForm.processing}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
                                    >
                                        {pricingForm.processing || capacityForm.processing ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                Enregistrement...
                                            </span>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Enregistrer les modifications
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="p-6 space-y-8">
                                    {/* 1. Status Section (Main Type Selection) */}
                                    <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-100 hover:border-indigo-100 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800">Statut du type</h4>
                                                <p className="text-xs text-slate-500 mt-0.5">Définissez si ce type est la référence tarifaire (100%) de l'hôtel.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => pricingForm.setData("main_type_id", selectedType.id.toString())}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                                                    Number(pricingForm.data.main_type_id) === selectedType.id
                                                        ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-600'
                                                }`}
                                            >
                                                {Number(pricingForm.data.main_type_id) === selectedType.id ? (
                                                    <><Check className="w-3.5 h-3.5" /> Type Principal (100%)</>
                                                ) : (
                                                    'Définir comme Principal'
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* 2. Pricing Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                                                <Percent className="w-3.5 h-3.5 text-slate-400" />
                                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tarification Relative</h4>
                                            </div>
                                            
                                            {selectedPricingIndex !== -1 && (
                                                <div className={`p-5 rounded-xl border transition-all h-24 flex flex-col justify-center ${
                                                    Number(pricingForm.data.main_type_id) === selectedType.id
                                                        ? "bg-indigo-50/30 border-indigo-100"
                                                        : "bg-white border-slate-100"
                                                }`}>
                                                    {Number(pricingForm.data.main_type_id) === selectedType.id ? (
                                                        <div className="text-center">
                                                            <div className="inline-flex text-[9px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded uppercase tracking-wider mb-1">Référence 100%</div>
                                                            <p className="text-[11px] text-slate-500 font-medium">Ce type définit le prix des autres.</p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative flex-1">
                                                                <input
                                                                    type="number"
                                                                    value={pricingForm.data.rules[selectedPricingIndex].percentage}
                                                                    onChange={(e) => {
                                                                        const newRules = [...pricingForm.data.rules];
                                                                        newRules[selectedPricingIndex].percentage = e.target.value;
                                                                        pricingForm.setData("rules", newRules);
                                                                    }}
                                                                    className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-slate-200 text-base font-bold focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 outline-none transition bg-white"
                                                                />
                                                                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 font-bold uppercase leading-tight">du prix<br/>de base</div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* 3. Capacity Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Capacité d'accueil</h4>
                                            </div>
                                            
                                            {selectedCapacityIndex !== -1 && (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <CapacityStepper 
                                                        label="Adultes" 
                                                        icon="Ad."
                                                        value={capacityForm.data.capacities[selectedCapacityIndex].capacite_adultes} 
                                                        onChange={(v) => {
                                                            const newCaps = [...capacityForm.data.capacities];
                                                            newCaps[selectedCapacityIndex].capacite_adultes = v;
                                                            capacityForm.setData('capacities', newCaps);
                                                        }}
                                                    />
                                                    <CapacityStepper 
                                                        label="Enfants" 
                                                        icon="Enf."
                                                        value={capacityForm.data.capacities[selectedCapacityIndex].capacite_enfants} 
                                                        onChange={(v) => {
                                                            const newCaps = [...capacityForm.data.capacities];
                                                            newCaps[selectedCapacityIndex].capacite_enfants = v;
                                                            capacityForm.setData('capacities', newCaps);
                                                        }}
                                                    />
                                                    <CapacityStepper 
                                                        label="Bébés" 
                                                        icon="Béb."
                                                        value={capacityForm.data.capacities[selectedCapacityIndex].capacite_bebes} 
                                                        onChange={(v) => {
                                                            const newCaps = [...capacityForm.data.capacities];
                                                            newCaps[selectedCapacityIndex].capacite_bebes = v;
                                                            capacityForm.setData('capacities', newCaps);
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Bottom Info Bar */}
                                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                        <Info className="w-3.5 h-3.5" />
                                        Modifications en suspens
                                    </div>
                                    <div className="text-[10px] text-slate-400 italic">Dernière mise à jour : aujourd'hui</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 p-12 transition-all hover:bg-slate-50">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                                <Info className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-slate-800 font-bold text-lg mb-1">Aucune sélection</h3>
                            <p className="text-sm font-medium text-center max-w-[240px] text-slate-500">Choisissez un type de chambre dans la liste pour configurer ses tarifs et capacités.</p>
                        </div>
                    )}
                </div>

                {/* 2. Type Selection Sidebar (Right - 1/3) */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Catalogue des Types
                            </h2>
                            <button
                                onClick={openCreate}
                                className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                            {types.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-xs italic font-medium">
                                    Aucun type enregistré.
                                </div>
                            ) : (
                                types.map((t) => {
                                    const isActive = selectedTypeId === t.id;
                                    const isMain = Number(pricingForm.data.main_type_id) === t.id;
                                    return (
                                        <div
                                            key={t.id}
                                            onClick={() => setSelectedTypeId(t.id)}
                                            className={`p-4 rounded-xl transition-all cursor-pointer group relative border-2 ${
                                                isActive 
                                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm' 
                                                    : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-1 h-10 rounded-full shrink-0"
                                                    style={{ backgroundColor: t.color || "#6366f1" }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className={`text-sm font-bold truncate ${isActive ? 'text-indigo-900' : 'text-slate-800'}`}>
                                                            {t.nom}
                                                        </h4>
                                                        {isMain && (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Type principal" />
                                                        )}
                                                    </div>
                                                    <p className={`text-[11px] line-clamp-1 italic mt-0.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}>
                                                        {t.description || "Aucune description"}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openEdit(t); }}
                                                        className={`p-1.5 rounded-lg transition-colors ${isActive ? 'text-indigo-400 hover:bg-indigo-100' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'}`}
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setConfirmDelete({ id: t.id, nom: t.nom }); }}
                                                        className={`p-1.5 rounded-lg transition-colors ${isActive ? 'text-indigo-400 hover:bg-indigo-100' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
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
            </div>

            {/* Modal & Dialog */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10">
                        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800">
                                {editingType
                                    ? "Modifier le type"
                                    : "Nouveau type"}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form
                            onSubmit={submitType}
                            className="p-7 flex flex-col gap-4"
                        >
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                                    Nom <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={typeForm.data.nom}
                                    onChange={(e) =>
                                        typeForm.setData("nom", e.target.value)
                                    }
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-slate-50 outline-none"
                                    placeholder="Ex: Suite Présidentielle"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                                    Description
                                </label>
                                <textarea
                                    value={typeForm.data.description}
                                    onChange={(e) =>
                                        typeForm.setData(
                                            "description",
                                            e.target.value,
                                        )
                                    }
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-slate-50 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                                    Couleur
                                </label>
                                <input
                                    type="color"
                                    value={typeForm.data.color}
                                    onChange={(e) =>
                                        typeForm.setData(
                                            "color",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={typeForm.processing}
                                className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors"
                            >
                                <Check className="w-4 h-4" />{" "}
                                {typeForm.processing
                                    ? "Enregistrement..."
                                    : "Enregistrer le Type"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleConfirmDelete}
                isLoading={deleting}
                title="Supprimer le type"
                description={`Êtes-vous sûr ? Cela affectera tous les hôtels.`}
                confirmLabel="Confirmer"
                variant="danger"
            />
        </div>
    );
}

function CapacityStepper({ label, value, onChange, icon }: { label: string; value: number; onChange: (v: number) => void; icon: string }) {
    return (
        <div className="flex flex-col gap-1.5 items-center sm:items-end min-w-[50px]">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                {icon}
            </span>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                <button
                    type="button"
                    onClick={() => onChange(Math.max(0, value - 1))}
                    className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                >
                    -
                </button>
                <span className="text-xs font-black w-4 text-center text-slate-700">
                    {value}
                </span>
                <button
                    type="button"
                    onClick={() => onChange(value + 1)}
                    className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                >
                    +
                </button>
            </div>
        </div>
    );
}

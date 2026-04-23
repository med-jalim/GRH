import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { 
    Percent, 
    Plus, 
    Trash2, 
    Edit3, 
    Save, 
    X, 
    Info,
    Calendar,
    BedDouble,
    ToggleLeft,
    ToggleRight,
    AlertCircle
} from 'lucide-react';

interface Discount {
    id: number;
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
    condition_type: 'min_nights' | 'min_rooms';
    condition_value: number;
    is_active: boolean;
}

interface Props {
    hotel: {
        id: number;
        name: string;
        discounts: Discount[];
    };
}

export function DiscountsTab({ hotel }: Props) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        type: 'percentage' as const,
        value: 0,
        condition_type: 'min_nights' as const,
        condition_value: 1,
        is_active: true,
    });

    const openEdit = (discount: Discount) => {
        setEditingDiscount(discount);
        setData({
            name: discount.name,
            type: discount.type,
            value: discount.value,
            condition_type: discount.condition_type,
            condition_value: discount.condition_value,
            is_active: discount.is_active,
        });
        setShowAddModal(true);
    };

    const closePortal = () => {
        setShowAddModal(false);
        setEditingDiscount(null);
        reset();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingDiscount) {
            put(`/admin/hotels/${hotel.id}/discounts/${editingDiscount.id}`, {
                onSuccess: () => closePortal(),
            });
        } else {
            post(`/admin/hotels/${hotel.id}/discounts`, {
                onSuccess: () => closePortal(),
            });
        }
    };

    const toggleStatus = (discountId: number) => {
        router.patch(`/admin/hotels/${hotel.id}/discounts/${discountId}/toggle`);
    };

    const deleteDiscount = (discountId: number) => {
        if (confirm('Voulez-vous vraiment supprimer cette remise ?')) {
            router.delete(`/admin/hotels/${hotel.id}/discounts/${discountId}`);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Header / Description */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shadow-sm">
                        <Percent className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">Remises & Offres spéciales</h3>
                        <p className="text-sm text-slate-500 mt-0.5 max-w-lg font-medium">
                            Configurez des réductions automatiques pour cet hôtel basées sur la durée du séjour ou le nombre de chambres réservées.
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Nouvelle remise
                </button>
            </div>

            {/* List of Discounts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotel.discounts?.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                            <Percent className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold">Aucune remise configurée pour cet hôtel.</p>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="mt-2 text-emerald-600 font-bold text-sm hover:underline"
                        >
                            Cliquez ici pour créer la première
                        </button>
                    </div>
                ) : (
                    hotel.discounts.map((discount) => (
                        <div 
                            key={discount.id} 
                            className={`group bg-white rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden ${!discount.is_active ? 'border-slate-100 opacity-75' : 'border-slate-200 shadow-sm'}`}
                        >
                            <div className={`h-1.5 w-full ${!discount.is_active ? 'bg-slate-300' : 'bg-emerald-500'}`} />
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800 text-base leading-tight group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{discount.name}</h4>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${discount.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500'}`}>
                                                {discount.is_active ? 'Active' : 'Désactivée'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-emerald-600">
                                            {discount.type === 'percentage' ? `${discount.value}%` : `${discount.value} MAD`}
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Réduction</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 mb-5 border border-slate-100">
                                    <div className="flex items-start gap-2.5">
                                        <Info className="w-3.5 h-3.5 text-emerald-500 mt-0.5" />
                                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                            Minimum de <strong className="text-slate-800 font-bold">{discount.condition_value}</strong>{' '}
                                            {discount.condition_type === 'min_nights' ? (
                                                <span className="inline-flex items-center gap-1">nuits <Calendar className="w-3 h-3 text-slate-400"/></span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1">chambres <BedDouble className="w-3 h-3 text-slate-400"/></span>
                                            )}.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                                    <div className="flex gap-1.5">
                                        <button 
                                            onClick={() => openEdit(discount)}
                                            className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100"
                                            title="Modifier"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => deleteDiscount(discount.id)}
                                            className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => toggleStatus(discount.id)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${discount.is_active ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'}`}
                                    >
                                        {discount.is_active ? (
                                            <><ToggleRight className="w-4 h-4" /> Désactiver</>
                                        ) : (
                                            <><ToggleLeft className="w-4 h-4" /> Activer</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal for Add/Edit */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={closePortal} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
                        <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shadow-sm">
                                    <Percent className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">{editingDiscount ? 'Modifier la remise' : 'Nouvelle règle de remise'}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Hôtel: {hotel.name}</p>
                                </div>
                            </div>
                            <button onClick={closePortal} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={submit} className="p-7 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Nom de l'offre <span className="text-rose-500">*</span></label>
                                <input 
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Ex: Offre Long Séjour"
                                    className={`w-full h-11 rounded-xl border-2 bg-slate-50/50 px-4 text-sm font-semibold text-slate-700 transition-all focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none ${errors.name ? 'border-rose-300' : 'border-slate-100'}`}
                                    required
                                />
                                {errors.name && <p className="text-rose-500 text-[10px] font-bold pl-1">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Type de réduction</label>
                                    <select 
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value as any)}
                                        className="w-full h-11 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-semibold text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none appearance-none"
                                    >
                                        <option value="percentage">Pourcentage (%)</option>
                                        <option value="fixed">Montant Fixe (MAD)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Valeur <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <input 
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.value}
                                            onChange={e => setData('value', parseFloat(e.target.value))}
                                            className="w-full h-11 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none"
                                            required
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px] uppercase tracking-tighter">
                                            {data.type === 'percentage' ? '%' : 'MAD'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 flex flex-col gap-4">
                                <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                                    <AlertCircle className="w-3.5 h-3.5" /> Conditions d'application
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest pl-1">Paramètre</label>
                                        <select 
                                            value={data.condition_type}
                                            onChange={e => setData('condition_type', e.target.value as any)}
                                            className="w-full h-10 rounded-lg border border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-800 focus:ring-4 focus:ring-emerald-500/20 outline-none"
                                        >
                                            <option value="min_nights">Min. de nuits</option>
                                            <option value="min_rooms">Min. de chambres</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest pl-1">Valeur Seuil</label>
                                        <input 
                                            type="number"
                                            min="1"
                                            value={data.condition_value}
                                            onChange={e => setData('condition_value', parseInt(e.target.value))}
                                            className="w-full h-10 rounded-lg border border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-800 focus:ring-4 focus:ring-emerald-500/20 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button 
                                    type="button" 
                                    onClick={closePortal}
                                    className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="flex-[2] h-12 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Chargement...' : (editingDiscount ? 'Enregistrer' : 'Créer la remise')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

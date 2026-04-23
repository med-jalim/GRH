import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { AdminLayout } from '@/Layouts/AdminLayout';
import { 
    Settings, 
    Percent, 
    Save, 
    Info, 
    Plus, 
    Trash2, 
    Calendar, 
    Users, 
    ToggleLeft, 
    ToggleRight, 
    X,
    CheckCircle2,
    Clock,
    BedDouble
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
    settings: {
        min_rooms: number;
    };
}

export default function Index({ settings }: Props) {
    // Form for global settings
    const settingsForm = useForm({
        min_rooms: settings.min_rooms,
    });

    const handleSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        settingsForm.post('/admin/settings/global');
    };

    return (
        <AdminLayout>
            <Head title="Paramètres Système" />

            <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 py-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
                                <Settings className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                    Paramètres du Système
                                </h1>
                                <p className="text-slate-500 text-sm font-medium">
                                    Configurez les règles et contraintes globales de la plateforme.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    
                    {/* Global Constraints */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                                <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                                    <BedDouble className="w-4 h-4" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 tracking-tight">Constraints Globales</h3>
                            </div>
                            
                            <form onSubmit={handleSettingsSubmit} className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">
                                        Minimum de Chambres par Réservation
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={settingsForm.data.min_rooms}
                                            onChange={e => settingsForm.setData('min_rooms', parseInt(e.target.value))}
                                            className="w-full h-14 bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 text-xl font-black text-slate-900 focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none"
                                            min="1"
                                        />
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-sm">
                                            RMS
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium px-1">
                                        Cette contrainte s'applique à tous les types d'hôtels et tous les clients.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={settingsForm.processing}
                                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98]"
                                >
                                    <Save className="w-4 h-4" />
                                    {settingsForm.processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                </button>
                            </form>
                        </div>

                        <div className="bg-indigo-600 rounded-[2rem] p-6 text-white overflow-hidden relative">
                             <Info className="w-24 h-24 absolute -right-6 -bottom-6 text-indigo-500/30 rotate-12" />
                             <h4 className="font-bold flex items-center gap-2 mb-2">
                                 <Info className="w-4 h-4" /> Note Structurelle
                             </h4>
                             <p className="text-xs text-indigo-100 leading-relaxed relative z-10">
                                 Les <strong>خصومات (remises)</strong> ne sont plus gérées ici. Vous les trouverez désormais directement dans la fiche de chaque <strong>Hôtel</strong> (onglet "Promotions").
                             </p>
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}

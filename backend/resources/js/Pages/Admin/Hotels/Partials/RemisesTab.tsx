import { Percent, Plus, Trash2, AlertCircle, Info, ShieldCheck, Globe } from "lucide-react";
import { useState } from "react";
import { useForm, router } from "@inertiajs/react";

interface DiscountRule {
  id: number;
  min_nights: number;
  discount_percentage: number;
}

interface RemisesTabProps {
  hotel: any;
  globalRules: DiscountRule[];
}

export default function RemisesTab({ hotel, globalRules }: RemisesTabProps) {
  const hotelRules = hotel.discount_rules || [];
  
  const [newRule, setNewRule] = useState({ 
    min_nights: '', 
    discount_percentage: '',
    id_hotel: hotel.id 
  });

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    router.post('/admin/settings/rules', newRule, {
      onSuccess: () => setNewRule({ min_nights: '', discount_percentage: '', id_hotel: hotel.id }),
      preserveScroll: true,
    });
  };

  const handleDeleteRule = (id: number) => {
    if (confirm('Supprimer cette règle spécifique ?')) {
      router.delete(`/admin/settings/rules/${id}`, {
        preserveScroll: true,
      });
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Remises spécifiques à l'hôtel</h2>
            <p className="text-sm text-slate-500 mt-1">
              Ces règles s'appliquent uniquement à <strong>{hotel.name}</strong>. Elles remplacent les règles globales si elles existent.
            </p>
          </div>
          <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200">
            Hôtel Unique
          </div>
        </div>

        <div className="p-8">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="pb-4">Nuits Minimum</th>
                <th className="pb-4 text-center">Remise (%)</th>
                <th className="pb-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {hotelRules.map((rule: DiscountRule) => (
                <tr key={rule.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 font-bold group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-all">
                        {rule.min_nights}
                      </div>
                      <span className="font-semibold text-slate-700">nuits ou plus</span>
                    </div>
                  </td>
                  <td className="py-5 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl font-black text-sm border border-emerald-100">
                      <Percent className="w-3.5 h-3.5" />
                      {rule.discount_percentage}%
                    </span>
                  </td>
                  <td className="py-5 text-right">
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {hotelRules.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="font-medium italic">Aucune règle spécifique définie. L'hôtel utilise les règles globales.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-8 bg-slate-50/50 border-t border-slate-100">
          <form onSubmit={handleAddRule} className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Min. Nuits</label>
              <input
                type="number"
                required
                placeholder="Ex: 12"
                value={newRule.min_nights}
                onChange={e => setNewRule({...newRule, min_nights: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Remise (%)</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="Ex: 9"
                value={newRule.discount_percentage}
                onChange={e => setNewRule({...newRule, discount_percentage: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-amber-700 transition-all active:scale-95 h-[46px] shadow-lg shadow-amber-600/20"
            >
              <Plus className="w-4 h-4" />
              Ajouter une règle
            </button>
          </form>
        </div>
      </div>

      {/* Global Rules Reference */}
      <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
              <Globe className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Règles Globales (Par défaut)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Ces remises s'appliquent si aucune règle spécifique n'est définie ci-dessus.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {globalRules.map((rule) => (
              <div key={rule.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">{rule.min_nights} nuits+</p>
                  <p className="text-xs font-bold text-slate-300">Remise par défaut</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-white">{rule.discount_percentage}%</span>
                </div>
              </div>
            ))}
            {globalRules.length === 0 && (
              <div className="col-span-full py-4 text-center border border-white/5 rounded-2xl">
                <p className="text-xs text-slate-500 italic">Aucune règle globale active.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex gap-4">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-600/20">
          <Info className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-indigo-900">À propos des remises par groupe</h4>
          <p className="text-xs text-indigo-700/70 mt-1 leading-relaxed">
            Contrairement au système précédent, la remise est désormais calculée pour chaque groupe individuellement. 
            Si une réservation contient deux groupes (ex: 2 nuits et 11 nuits), seule la remise correspondant aux 11 nuits sera appliquée au groupe concerné. 
            Ceci garantit une tarification plus précise et juste pour l'hôtel.
          </p>
        </div>
      </div>
    </div>
  );
}

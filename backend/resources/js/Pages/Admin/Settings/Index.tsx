import { AdminLayout } from "@/Layouts/AdminLayout";
import { 
  Settings, 
  Percent, 
  Moon, 
  Plus, 
  Trash2, 
  Save, 
  Info, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { useForm, router } from "@inertiajs/react";

interface AppSetting {
  id: number;
  key: string;
  value: string;
  label: string;
  type: string;
  description: string;
}

interface DiscountRule {
  id: number;
  min_nights: number;
  discount_percentage: number;
}

interface Props {
  settings: AppSetting[];
  rules: DiscountRule[];
}

export default function Index({ settings, rules }: Props) {

  // Form for App Settings
  const { data: settingsData, setData: setSettingsData, patch: patchSettings, processing: processingSettings } = useForm({
    settings: settings.map(s => ({ key: s.key, value: s.value }))
  });

  // Form for New/Edit Discount Rule
  const [newRule, setNewRule] = useState({ min_nights: '', discount_percentage: '' });

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    router.post('/admin/settings/rules', newRule, {
      onSuccess: () => setNewRule({ min_nights: '', discount_percentage: '' }),
    });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    patchSettings(route('admin.settings.update'), {
      preserveScroll: true,
    });
  };

  const handleDeleteRule = (id: number) => {
    if (confirm('Supprimer cette règle ?')) {
      router.delete(route('admin.settings.rules.destroy', id));
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-black" />
          Configuration du Système
        </h1>
        <p className="text-sm text-gray-400 mt-2 font-medium uppercase tracking-wider">
          Gérez vos remises, taxes et paramètres globaux
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Remises basées sur la durée</h2>
                  <p className="text-sm text-gray-500 mt-1">Définissez des pourcentages de réduction selon le nombre de nuits réservées.</p>
                </div>
                <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Actif
                </div>
              </div>

              <div className="p-8">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                      <th className="pb-4">Nuits Minimum</th>
                      <th className="pb-4 text-center">Remise (%)</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {rules.map((rule) => (
                      <tr key={rule.id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-900 font-bold group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all">
                              {rule.min_nights}
                            </div>
                            <span className="font-semibold text-gray-700">nuits ou plus</span>
                          </div>
                        </td>
                        <td className="py-5 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl font-black text-sm border border-green-100">
                            <Percent className="w-3.5 h-3.5" />
                            {rule.discount_percentage}%
                          </span>
                        </td>
                        <td className="py-5 text-right">
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {rules.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-gray-400">
                          <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                          <p className="font-medium">Aucun palier défini.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="p-8 bg-gray-50/50 border-t border-gray-50">
                <form onSubmit={handleAddRule} className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Min. Nuits</label>
                    <input
                      type="number"
                      required
                      placeholder="Ex: 12"
                      value={newRule.min_nights}
                      onChange={e => setNewRule({...newRule, min_nights: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-black outline-none transition-all"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Remise (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="Ex: 9"
                      value={newRule.discount_percentage}
                      onChange={e => setNewRule({...newRule, discount_percentage: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-black outline-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-800 transition-all active:scale-95 h-[46px]"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </button>
                </form>
              </div>
            </div>

            {/* Global Settings Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Paramètres Généraux</h2>
                  <p className="text-sm text-gray-500 mt-1">Configurez les règles globales du système de réservation.</p>
                </div>
                <button
                  onClick={handleSaveSettings}
                  disabled={processingSettings}
                  className="bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer
                </button>
              </div>

              <div className="p-8 space-y-6">
                {settings.map((setting, index) => (
                  <div key={setting.key} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <div className="md:w-1/3">
                      <label className="text-sm font-bold text-gray-900 block">{setting.label}</label>
                      <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
                    </div>
                    <div className="flex-1">
                      <input
                        type={setting.type === 'number' ? 'number' : 'text'}
                        value={settingsData.settings[index].value}
                        onChange={e => {
                          const newSettings = [...settingsData.settings];
                          newSettings[index].value = e.target.value;
                          setSettingsData('settings', newSettings);
                        }}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-black outline-none transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-[#10b981] rounded-3xl p-8 text-white shadow-xl shadow-green-500/20">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              Statut
            </h3>
            <p className="text-sm text-green-50 leading-relaxed mb-6 font-medium">
              Le système de remise par durée est actuellement activé. Le total des nuits de la réservation détermine automatiquement le pourcentage appliqué.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-2xl border border-white/10">
                <span className="text-xs font-black uppercase tracking-widest text-white/60">Paliers</span>
                <span className="text-2xl font-black ml-auto">{rules.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-gray-900 font-bold mb-4">Aide</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                <p className="text-sm text-gray-500 leading-relaxed">
                  Les remises s'appliquent uniquement sur le sous-total des chambres (hors taxes).
                </p>
              </div>
              <div className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                <p className="text-sm text-gray-500 leading-relaxed">
                  En cas de plusieurs paliers applicables, le système choisit automatiquement le palier avec le plus grand nombre de nuits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Add types for Ziggy route function if used
declare function route(name: string, params?: any): string;

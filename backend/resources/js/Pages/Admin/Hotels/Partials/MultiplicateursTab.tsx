import { useForm } from "@inertiajs/react";
import { Check, Info, Percent, TrendingUp } from "lucide-react";
import React from "react";

interface TarificationLine {
  id_type: number;
  type_nom: string | null;
  is_essentiel: boolean;
  pourcentage: number;
  cap_adultes: number;
  cap_enfants: number;
  cap_bebes: number;
}

interface Props {
  hotelId: number;
  tarification: TarificationLine[];
  types: any[];
}

export function MultiplicateursTab({ hotelId, tarification, types }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    id_hotel: hotelId,
    essentiel_type_id: tarification.find((t) => t.is_essentiel)?.id_type || "",
    types: types.map((type) => {
      const existing = tarification.find((t) => t.id_type === type.id);
      return {
        id_type: type.id,
        pourcentage: existing?.pourcentage ?? 100,
        cap_adultes: existing?.cap_adultes ?? 2,
        cap_enfants: existing?.cap_enfants ?? 0,
        cap_bebes: existing?.cap_bebes ?? 0,
      };
    }),
  });

  const handlePourcentageChange = (index: number, value: string) => {
    const newTypes = [...data.types];
    newTypes[index].pourcentage = parseFloat(value) || 0;
    setData("types", newTypes);
  };

  const handleCapChange = (index: number, field: string, value: string) => {
    const newTypes = [...data.types];
    (newTypes[index] as any)[field] = parseInt(value) || 0;
    setData("types", newTypes);
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post(`/admin/hotels/${hotelId}/tarification`);
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Grille de Tarification (Multiplicateurs)</h2>
              <p className="text-xs text-slate-500 mt-0.5">Définissez quel type de chambre est la référence (100%) et les ratios pour les autres.</p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="p-6">
          <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-4">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-amber-200 flex-shrink-0">
               <Info className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-xs text-amber-800 leading-relaxed">
              <p className="font-bold mb-1">Comment ça marche ?</p>
              <p>Le type "Essentiel" est la base de prix (100%). Les autres types sont calculés par rapport à lui.</p>
              <p className="mt-1 opacity-80">Exemple: Si l'Essentiel est à 100€ et que la Suite est à 150%, le prix de la Suite sera de 150€.</p>
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-4 py-3">Base</th>
                  <th className="px-4 py-3">Type de chambre</th>
                  <th className="px-4 py-3">Ratio (%)</th>
                  <th className="px-4 py-3">Occupation Standard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.types.map((t, idx) => {
                  const type = types.find(yt => yt.id === t.id_type);
                  const isEssentiel = data.essentiel_type_id === t.id_type;
                  
                  return (
                    <tr key={t.id_type} className={`hover:bg-slate-50/50 transition-colors ${isEssentiel ? 'bg-indigo-50/30' : ''}`}>
                      <td className="px-4 py-4">
                        <input
                          type="radio"
                          name="essentiel"
                          checked={isEssentiel}
                          onChange={() => setData("essentiel_type_id", t.id_type)}
                          className="w-4 h-4 text-indigo-600 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-bold text-slate-700">{type?.nom}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="relative w-28">
                          <input
                            type="number"
                            value={t.pourcentage}
                            onChange={(e) => handlePourcentageChange(idx, e.target.value)}
                            className="w-full pl-3 pr-8 py-1.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                          />
                          <Percent className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                         <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-0.5">
                               <label className="text-[9px] font-bold text-slate-400 uppercase">Adu.</label>
                               <input type="number" min="0" value={t.cap_adultes} onChange={(e) => handleCapChange(idx, 'cap_adultes', e.target.value)} className="w-12 px-2 py-1 rounded border border-slate-200 text-xs font-semibold" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                               <label className="text-[9px] font-bold text-slate-400 uppercase">Enf.</label>
                               <input type="number" min="0" value={t.cap_enfants} onChange={(e) => handleCapChange(idx, 'cap_enfants', e.target.value)} className="w-12 px-2 py-1 rounded border border-slate-200 text-xs font-semibold" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                               <label className="text-[9px] font-bold text-slate-400 uppercase">Béb.</label>
                               <input type="number" min="0" value={t.cap_bebes} onChange={(e) => handleCapChange(idx, 'cap_bebes', e.target.value)} className="w-12 px-2 py-1 rounded border border-slate-200 text-xs font-semibold" />
                            </div>
                         </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-200 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {processing ? "Enregistrement..." : "Enregistrer la configuration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

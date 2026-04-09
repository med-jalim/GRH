import type { RoomSelection, RoomType } from '@/types/booking';
import { formatPrice } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { BedDouble } from 'lucide-react';
import { useMemo } from 'react';
import { computeDynamicPrice } from '@/lib/utils';
import type { Hotel } from '@/types/booking';

interface RoomOption {
  type: RoomType;
  price: number;
}

interface Props {
  hotel:            Hotel | null;
  checkInDate:      string;
  room:             RoomSelection;
  availableOptions: RoomOption[]; 
  onChange:         (uid: string, field: keyof RoomSelection, value: any) => void;
  onRemove:         (uid: string) => void;
  availability?: {
    available: boolean;
    remaining: number;
    total: number;
    capacities?: {
      cap_adultes: number;
      cap_enfants: number;
      cap_bebes: number;
    }
  } | null;
}

export function RoomRow({ hotel, checkInDate, room, availableOptions, onChange, onRemove, availability }: Props) {
  const optionsWithDynamicPrices = useMemo(() => {
    return availableOptions.map(opt => ({
      ...opt,
      dynamicPrice: hotel ? computeDynamicPrice(hotel, opt.type.id, checkInDate) : opt.price
    }));
  }, [hotel, checkInDate, availableOptions]);

  const selectedOption = optionsWithDynamicPrices.find(opt => opt.type.id === room.roomTypeId);
  const price = selectedOption?.dynamicPrice || 0;

  return (
    <div className={`flex flex-col gap-5 p-6 bg-white rounded-[2rem] border ${availability && !availability.available ? 'border-rose-200 bg-rose-50/10' : 'border-slate-100 shadow-sm'} group-room relative hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500`}>
      
      {/* 1. Header: Type Label + Remove Button */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-slate-200">
             <BedDouble className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">
              {selectedOption ? selectedOption.type.nom : "Type d'Hébergement"}
            </h4>
            <div className="mt-1">
                {availability && room.roomTypeId > 0 ? (
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${availability.available ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} animate-in fade-in zoom-in duration-300`}>
                        <div className={`w-1 h-1 rounded-full ${availability.available ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">
                            {availability.available ? `${availability.remaining} dispos` : 'Complet'}
                        </span>
                    </div>
                ) : (
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">Sélectionnez une option</p>
                )}
            </div>
          </div>
        </div>

        <button
            type="button"
            onClick={() => onRemove(room.uid)}
            className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90 border border-transparent hover:border-rose-100 group"
            title="Supprimer cette chambre"
        >
            <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </button>
      </div>

      {/* 2. Body: Selection + Quantity */}
      <div className="flex flex-col md:flex-row items-end gap-5">
        <div className="flex-1 space-y-1.5 w-full">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Modifier le type</label>
            <select
                value={room.roomTypeId}
                onChange={e => onChange(room.uid, 'roomTypeId', Number(e.target.value))}
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 px-5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#54b172]/10 focus:border-[#54b172] transition-all cursor-pointer hover:bg-white"
            >
                <option value={0} disabled>-- Cliquez pour choisir le type --</option>
                {optionsWithDynamicPrices.map(opt => (
                    <option key={opt.type.id} value={opt.type.id}>
                        {opt.type.nom} — {formatPrice(opt.dynamicPrice)} / nuit
                    </option>
                ))}
            </select>
        </div>

        <div className="w-full md:w-32 space-y-1.5 shrink-0">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Nombre d'unités</label>
            <div className="relative">
                <Input
                    type="number"
                    min="1"
                    value={room.quantity}
                    onChange={e => onChange(room.uid, 'quantity', Math.max(1, Number(e.target.value)))}
                    className="h-12 bg-slate-50/50 rounded-2xl border-slate-200 font-black text-sm focus:ring-[#54b172]/10 focus:border-[#54b172] text-center pl-4 shadow-inner"
                />
            </div>
        </div>
      </div>

      {/* 3. Footer: Capacities */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50/60 rounded-[1.5rem] border border-slate-100">
        <div className="space-y-1.5">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">Adultes</label>
           <div className="relative">
               <Input
                  type="number"
                  min="0"
                  max={(availability?.capacities?.cap_adultes ?? 99) * room.quantity}
                  value={room.adults}
                  onChange={e => onChange(room.uid, 'adults', Math.max(0, Number(e.target.value)))}
                  className={`h-11 bg-white rounded-xl border border-slate-200 font-bold text-xs text-center focus:ring-emerald-500/20 focus:border-emerald-500 ${room.adults > ((availability?.capacities?.cap_adultes ?? 99) * room.quantity) ? 'border-rose-500 text-rose-600' : ''}`}
               />
               {availability?.capacities && (
                  <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-400 whitespace-nowrap">MAX: {availability.capacities.cap_adultes * room.quantity}</span>
               )}
           </div>
        </div>

        <div className="space-y-1.5">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">Enfants</label>
           <div className="relative">
               <Input
                  type="number"
                  min="0"
                  max={(availability?.capacities?.cap_enfants ?? 99) * room.quantity}
                  value={room.children}
                  onChange={e => onChange(room.uid, 'children', Math.max(0, Number(e.target.value)))}
                  className={`h-11 bg-white rounded-xl border border-slate-200 font-bold text-xs text-center focus:ring-blue-500/20 focus:border-blue-500 ${room.children > ((availability?.capacities?.cap_enfants ?? 99) * room.quantity) ? 'border-rose-500 text-rose-600' : ''}`}
               />
               {availability?.capacities && (
                  <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-blue-400 whitespace-nowrap">MAX: {availability.capacities.cap_enfants * room.quantity}</span>
               )}
           </div>
        </div>

        <div className="space-y-1.5">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">Bébés</label>
           <div className="relative">
               <Input
                  type="number"
                  min="0"
                  max={(availability?.capacities?.cap_bebes ?? 99) * room.quantity}
                  value={room.babies}
                  onChange={e => onChange(room.uid, 'babies', Math.max(0, Number(e.target.value)))}
                  className={`h-11 bg-white rounded-xl border border-slate-200 font-bold text-xs text-center focus:ring-amber-500/20 focus:border-amber-500 ${room.babies > ((availability?.capacities?.cap_bebes ?? 99) * room.quantity) ? 'border-rose-500 text-rose-600' : ''}`}
               />
               {availability?.capacities && (
                  <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-amber-500 whitespace-nowrap">MAX: {availability.capacities.cap_bebes * room.quantity}</span>
               )}
           </div>
        </div>
      </div>
    </div>
  );
}

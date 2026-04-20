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
  index:            number;
  hotel:            Hotel | null;
  checkInDate:      string;
  room:             RoomSelection;
  availableOptions: RoomOption[]; 
  onChange:         (uid: string, field: keyof RoomSelection, value: any) => void;
  onRemove:         (uid: string) => void;
  disabledSubTypeIds?: number[];
  availability?: {
    available: boolean;
    remaining: number;
    total: number;
  } | null;
  multiplier: number;
}

export function RoomRow({ index, hotel, checkInDate, room, availableOptions, onChange, onRemove, availability, multiplier, disabledSubTypeIds = [] }: Props) {
  const optionsWithDynamicPrices = useMemo(() => {
    return availableOptions.map(opt => ({
      ...opt,
      dynamicPrice: hotel ? computeDynamicPrice(hotel, opt.type.id, room.subTypeId, checkInDate, multiplier) : opt.price
    }));
  }, [hotel, checkInDate, availableOptions, room.subTypeId, multiplier]);

  const selectedOption = optionsWithDynamicPrices.find(opt => opt.type.id === room.roomTypeId);
  const selectedSubType = selectedOption?.type.sub_types?.find((st: any) => st.id === room.subTypeId);
  const price = selectedOption?.dynamicPrice || 0;

  const capacityValidation = useMemo(() => {
    if (!selectedSubType) {
      return {
        hasError: false,
        adultLimitExceeded: false,
        childrenLimitExceeded: false,
        totalLimitExceeded: false,
        message: '',
      };
    }

    const quantity = Math.max(1, room.quantity || 1);
    const maxAdults = (selectedSubType.max_adults ?? 0) * quantity;
    const maxChildren = (selectedSubType.max_children ?? 0) * quantity;
    const maxTotal = (selectedSubType.capacity_total ?? 0) * quantity;

    const adultLimitExceeded = room.adults > maxAdults;
    const childrenLimitExceeded = room.children > maxChildren;
    const totalLimitExceeded = (room.adults + room.children) > maxTotal;

    let message = '';
    if (adultLimitExceeded) {
      message = `Adultes dépassés: ${room.adults}/${maxAdults}`;
    } else if (childrenLimitExceeded) {
      message = `Enfants dépassés: ${room.children}/${maxChildren}`;
    } else if (totalLimitExceeded) {
      message = `Total adultes + enfants dépassé: ${room.adults + room.children}/${maxTotal}`;
    }

    return {
      hasError: adultLimitExceeded || childrenLimitExceeded || totalLimitExceeded,
      adultLimitExceeded,
      childrenLimitExceeded,
      totalLimitExceeded,
      message,
    };
  }, [selectedSubType, room.adults, room.children, room.quantity]);

  const hasOccupancyError = capacityValidation.hasError;



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
              Chambre #{index + 1}
            </h4>
            <div className="mt-1">
                {availability && room.roomTypeId > 0 && room.subTypeId > 0 ? (
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
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Type de chambre</label>
            <select
                value={room.roomTypeId}
                onChange={e => {
                  const val = Number(e.target.value);
                  onChange(room.uid, 'roomTypeId', val);
                }}
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 px-5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#54b172]/10 focus:border-[#54b172] transition-all cursor-pointer hover:bg-white"
            >
                <option value={0} disabled>-- Choisir le type --</option>
                {optionsWithDynamicPrices.map(opt => (
                    <option key={opt.type.id} value={opt.type.id}>
                        {opt.type.nom}
                    </option>
                ))}
            </select>
        </div>

        {room.roomTypeId > 0 && (
          <div className="flex-1 space-y-1.5 w-full animate-in fade-in slide-in-from-left-2 transition-all">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Occupation</label>
              <select
                  value={room.subTypeId}
                  onChange={e => onChange(room.uid, 'subTypeId', Number(e.target.value))}
                  className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 px-5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#54b172]/10 focus:border-[#54b172] transition-all cursor-pointer hover:bg-white"
              >
                  <option value={0} disabled>-- Choisir l'occupation --</option>
                  {selectedOption?.type.sub_types
                      ?.filter((st: any) => !disabledSubTypeIds.includes(st.id))
                      .map((st: any) => {
                      const dynamicPrice = hotel ? computeDynamicPrice(hotel, room.roomTypeId, st.id, checkInDate, multiplier) : 0;
                      return (
                        <option key={st.id} value={st.id}>
                            {st.nom} — {formatPrice(dynamicPrice)} / nuit
                        </option>
                      );
                  })}
              </select>
          </div>
        )}

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
      <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50/60 rounded-[1.5rem] border border-slate-100">
         {/* Adultes */}
         <div className="space-y-1.5">
            <div className="flex justify-between items-end mb-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block" title="Nombre d'adultes">Adultes</label>
                {selectedSubType && (capacityValidation.adultLimitExceeded || capacityValidation.totalLimitExceeded) && (
                    <span className="text-[8px] font-black text-rose-500 uppercase animate-pulse">Invalide !</span>
                )}
            </div>
            <div className="relative">
                <Input
                   type="number"
                   min="0"
                   value={room.adults}
                   onChange={e => onChange(room.uid, 'adults', Math.max(0, Number(e.target.value)))}
                   className={`h-11 bg-white rounded-xl border font-bold text-xs text-center text-emerald-800 transition-all focus:ring-4 ${
                       selectedSubType && hasOccupancyError
                       ? 'border-rose-500 bg-rose-50/30 focus:ring-rose-500/10 focus:border-rose-500'
                       : 'border-slate-200 focus:ring-emerald-500/10 focus:border-emerald-500'
                   }`}
                />
            </div>
         </div>

         {/* Enfants */}
         <div className="space-y-1.5">
            <div className="flex justify-between items-end mb-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block" title="Nombre d'enfants">Enfants</label>
                {selectedSubType && (capacityValidation.childrenLimitExceeded || capacityValidation.totalLimitExceeded) && (
                    <span className="text-[8px] font-black text-rose-500 uppercase animate-pulse">Invalide !</span>
                )}
            </div>
            <div className="relative">
                <Input
                   type="number"
                   min="0"
                   value={room.children}
                   onChange={e => onChange(room.uid, 'children', Math.max(0, Number(e.target.value)))}
                   className={`h-11 bg-white rounded-xl border font-bold text-xs text-center text-blue-600 transition-all focus:ring-4 ${
                       selectedSubType && hasOccupancyError
                       ? 'border-rose-500 bg-rose-50/30 focus:ring-rose-500/10 focus:border-rose-500'
                       : 'border-slate-200 focus:ring-blue-500/10 focus:border-blue-500'
                   }`}
                />
            </div>
         </div>

      </div>
      {selectedSubType && capacityValidation.hasError && (
        <p className="text-[11px] font-bold text-rose-600 -mt-1">
          {capacityValidation.message}
        </p>
      )}
    </div>
  );
}

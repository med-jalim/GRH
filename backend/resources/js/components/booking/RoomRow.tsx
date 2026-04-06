import type { RoomSelection, RoomType } from '@/types/booking';
import { formatPrice } from '@/data/mockData';
import { Input } from '@/components/ui/input';

interface RoomOption {
  type: RoomType;
  price: number;
}

interface Props {
  room:             RoomSelection;
  availableOptions: RoomOption[]; 
  nights:           number;
  index:            number;
  onChange:         (uid: string, field: keyof RoomSelection, value: number) => void;
  onRemove:         (uid: string) => void;
}

export function RoomRow({ room, availableOptions, nights, index, onChange, onRemove }: Props) {
  const selectedOption = availableOptions.find(opt => opt.type.id === room.roomTypeId);
  const price    = selectedOption?.price || 0;
  const subtotal = price * nights;

  return (
    <div className="group flex flex-col sm:flex-row gap-4 p-5 bg-white rounded-2xl border border-slate-200 hover:border-[#54b172]/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
      <div className="flex items-center sm:items-start pt-1">
        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-400 text-[10px] font-black flex items-center justify-center flex-shrink-0 border border-slate-200 group-hover:bg-[#54b172] group-hover:text-white group-hover:border-[#54b172] transition-colors">
          {index + 1}
        </span>
      </div>

      <div className="flex-1 space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Type de chambre</label>
        <select
          value={room.roomTypeId}
          onChange={e => onChange(room.uid, 'roomTypeId', Number(e.target.value))}
          className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#54b172]/20 focus:border-[#54b172] transition-all"
        >
          {availableOptions.map(opt => (
            <option key={opt.type.id} value={opt.type.id}>
              {opt.type.nom} — {formatPrice(opt.price)}/nuit
            </option>
          ))}
        </select>
      </div>

      <div className="w-full sm:w-40 space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Quantité</label>
        <Input
          type="number"
          min="1"
          value={room.quantity}
          onChange={e => onChange(room.uid, 'quantity', Math.max(1, Number(e.target.value)))}
          className="h-10 bg-slate-50/50 rounded-xl border-slate-200 font-bold text-sm focus:ring-[#54b172]/20 focus:border-[#54b172]"
        />
      </div>

      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 sm:w-36 pt-1">
        <div className="text-right">
          {selectedOption && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">{formatPrice(price * room.quantity)}/nuit</p>
          )}
          <p className="text-lg font-black text-[#54b172] leading-none tracking-tighter">
            {formatPrice(subtotal * room.quantity)}
          </p>
          {nights > 0 && <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1">{nights} Nuits</p>}
        </div>
      </div>

      <div className="flex items-center justify-center pl-2">
        <button
            type="button"
            onClick={() => onRemove(room.uid)}
            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95"
            title="Supprimer cette ligne"
        >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>
    </div>
  );
}

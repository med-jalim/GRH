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
  onChange:         (uid: string, field: keyof RoomSelection, value: any) => void;
  onRemove:         (uid: string) => void;
  availability?: {
    available: boolean;
    remaining: number;
    total: number;
  } | null;
}

export function RoomRow({ room, availableOptions, onChange, onRemove, availability }: Props) {
  const selectedOption = availableOptions.find(opt => opt.type.id === room.roomTypeId);
  const price = selectedOption?.price || 0;

  return (
    <div className={`flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-xl border ${availability && !availability.available ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200/60'} items-end shadow-sm group-room relative transition-all duration-300`}>
      {/* Room Type */}
      <div className="flex-1 space-y-1.5 w-full">
        <div className="flex justify-between items-center px-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type de Chambre</label>
          
          {availability && room.roomTypeId > 0 && (
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${availability.available ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} animate-in fade-in zoom-in duration-300`}>
              <div className={`w-1 h-1 rounded-full ${availability.available ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="text-[10px] font-black uppercase tracking-tighter">
                {availability.available ? `${availability.remaining} disponibles` : 'Complet'}
              </span>
            </div>
          )}
        </div>
        <select
          value={room.roomTypeId}
          onChange={e => onChange(room.uid, 'roomTypeId', Number(e.target.value))}
          className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#54b172]/20 focus:border-[#54b172] transition-all"
        >
          <option value={0} disabled>Choisir un type...</option>
          {availableOptions.map(opt => (
            <option key={opt.type.id} value={opt.type.id}>
              {opt.type.nom} — {formatPrice(opt.price)} / nuit
            </option>
          ))}
        </select>
      </div>

      {/* Quantity */}
      <div className="w-full sm:w-28 space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantité</label>
        <Input
          type="number"
          min="1"
          value={room.quantity}
          onChange={e => onChange(room.uid, 'quantity', Math.max(1, Number(e.target.value)))}
          className="h-11 bg-slate-50/50 rounded-xl border-slate-200 font-bold text-xs focus:ring-[#54b172]/20 focus:border-[#54b172]"
        />
      </div>

      {/* Remove Button */}
      <button
          type="button"
          onClick={() => onRemove(room.uid)}
          className="h-11 px-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-95 flex items-center justify-center border border-transparent hover:border-rose-100"
          title="Supprimer cette chambre"
      >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
      </button>
    </div>
  );
}

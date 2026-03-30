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
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
      <div className="flex items-center sm:items-start pt-1">
        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </span>
      </div>

      <div className="flex-1 space-y-1">
        <label className="text-xs font-medium text-slate-500">Type de chambre</label>
        <select
          value={room.roomTypeId}
          onChange={e => onChange(room.uid, 'roomTypeId', Number(e.target.value))}
          className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
        >
          {availableOptions.map(opt => (
            <option key={opt.type.id} value={opt.type.id}>
              {opt.type.nom} — {formatPrice(opt.price)}/nuit
            </option>
          ))}
        </select>
      </div>

      <div className="w-full sm:w-36 space-y-1">
        <label className="text-xs font-medium text-slate-500">Nombre de chambres</label>
        <Input
          type="number"
          min="1"
          value={room.quantity}
          onChange={e => onChange(room.uid, 'quantity', Math.max(1, Number(e.target.value)))}
          className="h-9 bg-white"
        />
      </div>

      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 sm:w-32 pt-1">
        <div className="text-center sm:text-right">
          {selectedOption && (
            <p className="text-xs text-slate-400">{formatPrice(price * room.quantity)}<span className="text-[10px]">/nuit</span></p>
          )}
          {subtotal > 0 && (
            <p className="text-sm font-bold text-amber-600">{formatPrice(subtotal * room.quantity)}</p>
          )}
          {nights > 0 && <p className="text-[10px] text-slate-400">{nights} nuits</p>}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(room.uid)}
        className="self-start sm:self-center p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

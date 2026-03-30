import type { RoomSelection, Hotel } from '@/types/booking';
import { formatPrice } from '@/data/mockData';

interface Props {
  rooms:      RoomSelection[];
  hotel:      Hotel | null;
  nights:     number;
  totalPrice: number;
}

export function PriceSummary({ rooms, hotel, nights, totalPrice }: Props) {
  if (!hotel || rooms.length === 0 || nights === 0) return null;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        <h3 className="text-sm font-semibold text-slate-200">Récapitulatif des prix</h3>
      </div>

      <div className="space-y-2.5 mb-4">
        {rooms.map(room => {
          const chambre = hotel.chambres.find(c => c.id_type === room.roomTypeId);
          const tarif   = hotel.tarifs.find(t => t.id_type === room.roomTypeId);
          
          if (!chambre || !tarif) return null;
          
          const sub = tarif.prix * nights * room.quantity;
          return (
            <div key={room.uid} className="flex justify-between items-start gap-2">
              <div>
                <p className="text-xs text-slate-300">{chambre.type.nom}</p>
                <p className="text-[10px] text-slate-500">
                  {room.quantity} chambre{room.quantity > 1 ? 's' : ''} × {formatPrice(tarif.prix)} × {nights} nuit{nights > 1 ? 's' : ''}
                </p>
              </div>
              <span className="text-sm font-semibold text-amber-300 whitespace-nowrap">{formatPrice(sub)}</span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-400">Total estimé</p>
          <p className="text-[10px] text-slate-500">{nights} nuit{nights > 1 ? 's' : ''} · {rooms.length} chambre{rooms.length > 1 ? 's' : ''}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-amber-400">{formatPrice(totalPrice)}</p>
        </div>
      </div>
    </div>
  );
}
